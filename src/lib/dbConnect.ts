import mongoose from 'mongoose';

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to database");
        return;
    }
    try{
        const db = await mongoose.connect(process.env.MONGO_URI || '', {})

        connection.isConnected = db.connections[0].readyState
        
        console.log("Db: ",db);
        console.log("Connection: " ,db.connection);
        console.log("Connections: ",db.connections);

        
        // connection.isConnected = 1;
        console.log("Db connected successfully");
        
    }catch(err){
        console.log("Database connection failed",err);
        process.exit(1)
    }
}

export default dbConnect