import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URL;

        if (!mongoURI) {
            console.error('Chyba: MONGO_URL není definována v .env souboru.');
            process.exit(1);
        }

        await mongoose.connect(mongoURI, {
        });

        console.log('MongoDB připojeno úspěšně.');

        mongoose.connection.on('error', (err) => {
            console.error(`MongoDB chyba připojení: ${err}`);
            process.exit(1);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB odpojeno.');
        });

    } catch (error) {
        console.error(`Chyba při připojování k MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
