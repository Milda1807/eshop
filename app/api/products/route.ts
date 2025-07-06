import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const category = searchParams.get('category');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';
        const skip = (page - 1) * limit;


        const where: Prisma.ProductWhereInput = category
            ? { published: true, category: { name: category } }
            : { published: true };


        const allowedSortBy = ['name', 'price', 'createdAt', 'stock'];
        const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
        const orderBy = { [safeSortBy]: sortOrder };


        const [products, totalProducts] = await prisma.$transaction([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: { category: true },
            }),
            prisma.product.count({ where }),
        ]);

        const totalPages = Math.ceil(totalProducts / limit);

        return NextResponse.json({
            success: true,
            data: products,
            meta: {
                count: products.length,
                totalProducts,
                totalPages,
                currentPage: page,
            }
        }, { status: 200 });

    } catch (error) {
        console.error("API GET /api/products chyba:", error);
        const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba serveru.';
        return NextResponse.json({
            success: false,
            error: 'Chyba serveru při získávání produktů.',
            details: errorMessage
        }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Destrukturace zůstává stejná
        const { name, description, shortDescription, price, sku, category: categoryName, stock, imageUrl } = body;

        // Kontrola povinných polí zůstává stejná
        if (!name || !price || !sku || !categoryName) {
            return NextResponse.json({
                success: false,
                error: 'Chybějící povinná pole: name, price, sku, categoryName.'
            }, { status: 400 });
        }

        // ZDE JE ZMĚNA
        // Původní findUnique a if blok je nahrazen tímto jedním příkazem
        const categoryRecord = await prisma.category.upsert({
            where: { name: categoryName },
            update: {},
            create: { name: categoryName },
        });

        // Vytvoření produktu zůstává stejné, teď už vždy bude mít platné categoryRecord.id
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                shortDescription,
                price,
                sku,
                stock,
                imageUrl,
                categoryId: categoryRecord.id // Toto teď bude vždy fungovat
            },
            include: {
                category: true,
            }
        });

        return NextResponse.json({ success: true, data: newProduct }, { status: 201 });

    } catch (error) {
        // Zpracování chyb zůstává stejné
        console.error("API POST /api/products chyba:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const target = (error.meta?.target as string[])?.join(', ');
                return NextResponse.json({
                    success: false,
                    error: `Produkt s tímto ${target} již existuje.`
                }, { status: 409 });
            }
        }

        const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba serveru.';
        return NextResponse.json({
            success: false,
            error: 'Chyba serveru při vytváření produktu.',
            details: errorMessage
        }, { status: 500 });
    }
}