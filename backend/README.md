# BookMySlot Backend

Backend API for the BookMySlot MERN scheduling application.

## MongoDB Connection String Format

To connect to a MongoDB Atlas cluster, use the following URI format inside your `.env` file under `MONGO_URI` or `MONGODB_URI`:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/bookmyslot?retryWrites=true&w=majority
```

Replace:
- `<username>`: Your database user username.
- `<password>`: Your database user password.
- `<cluster-url>`: The Atlas cluster hostname (e.g. `cluster0.abcde.mongodb.net`).

## Local Setup
1. Install dependencies: `npm install`
2. Configure `.env` variables.
3. Start the server: `npm run dev` or `npm start`
