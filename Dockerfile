# 1. 빌드 스테이지
FROM node:20-alpine as build
WORKDIR /app

# 패키지 설치
COPY package.json package-lock.json ./
# pnpm을 사용하시는 경우 npm install 대신 corepack enable && pnpm install 사용 권장
RUN npm install

# 소스 복사 및 빌드
COPY . .
# 필요한 경우 환경변수를 빌드 타임에 주입할 수 있습니다. (예: ARG VITE_API_URL)
RUN npm run build

# 2. 실행 스테이지 (Nginx)
FROM nginx:alpine
# 1단계에서 작성한 커스텀 Nginx 설정 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 빌드된 정적 파일을 Nginx가 서빙할 폴더로 복사
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]