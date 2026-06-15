# ZeePark Frontend

This is the standalone frontend service for ZeePark.

## Deployment

To deploy the frontend:

1.  Configure `EXPO_PUBLIC_API_BASE_URL` in `.env` to point to your deployed backend API.
2.  Run with Docker Compose:

```bash
docker-compose up -d --build
```

The frontend will be available at `http://localhost`.

Note: The API URL is baked into the frontend during the Docker build process. If you change the API URL in `.env`, you must rebuild the image:

```bash
docker-compose up -d --build
```
