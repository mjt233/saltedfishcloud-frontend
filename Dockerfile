# ============================================================
# 多阶段构建：咸鱼云云前端
# 阶段 1 - install：安装依赖（利用 BuildKit cache 持久化 npm 缓存）
# 阶段 2 - build ：执行 vite 构建
# 阶段 3 - output：仅保留 dist 产物，用于 docker cp 导出
# ============================================================

# ---------- 阶段 1：安装依赖 ----------
FROM node:24-bookworm AS install

WORKDIR /app

# 先复制 lock 文件和所有 package.json（含 sfc-common 本地包）
# 这样只要依赖没变，npm ci 就能命中 Docker 层缓存
COPY package.json package-lock.json ./
COPY sfc-common/package.json ./sfc-common/

# ci 速度快、确定性高；--ignore-scripts 跳过 postinstall 避免报错
# npm-cache 是 BuildKit 持久化缓存目录，跨构建复用
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ---------- 阶段 2：构建 ----------
FROM install AS build

WORKDIR /app

# 复制全部源码（node_modules 已在 install 阶段就绪）
COPY . .

# 安装 sass-embedded 的平台二进制（npm ci --ignore-scripts 会跳过）
RUN npm rebuild sass-embedded || true

ENV NODE_OPTIONS="--max-old-space-size=4096"

# 执行主应用 + OAuth 构建
RUN npm run build

# （可选）构建所有扩展插件；按需取消注释
# RUN npm run build-ext-all

# ---------- 阶段 3：输出产物 ----------
FROM scratch AS output

# 仅将 dist 目录复制到最终镜像
COPY --from=build /app/dist /dist
