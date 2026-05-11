# -------- BUILD --------
    FROM node:20-alpine AS builder
 
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
   
    COPY prisma ./prisma
    COPY prisma.config.ts ./
    RUN npx prisma generate
    
    COPY . .
    RUN npm run build
    
# -------- RUN --------
    FROM node:20-alpine
    
    WORKDIR /app
    
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/prisma ./prisma
    COPY --from=builder /app/prisma.config.ts ./ 
    COPY package*.json ./
    
    
    EXPOSE 3000
    
    CMD ["node", "dist/src/main.js"]