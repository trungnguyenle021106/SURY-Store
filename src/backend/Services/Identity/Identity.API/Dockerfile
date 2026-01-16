FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy toàn bộ file .csproj
COPY ["Services/Identity/Identity.API/Identity.API.csproj", "Services/Identity/Identity.API/"]
COPY ["Services/Identity/Identity.Domain/Identity.Domain.csproj", "Services/Identity/Identity.Domain/"]
COPY ["Services/Identity/Identity.Application/Identity.Application.csproj", "Services/Identity/Identity.Application/"]
COPY ["Services/Identity/Identity.Infrastructure/Identity.Infrastructure.csproj", "Services/Identity/Identity.Infrastructure/"]

COPY ["BuildingBlocks/BuildingBlocks.Core/BuildingBlocks.Core.csproj", "BuildingBlocks/BuildingBlocks.Core/"]
COPY ["BuildingBlocks/BuildingBlocks.Application/BuildingBlocks.Application.csproj", "BuildingBlocks/BuildingBlocks.Application/"]
COPY ["BuildingBlocks/BuildingBlocks.Infrastructure/BuildingBlocks.Infrastructure.csproj", "BuildingBlocks/BuildingBlocks.Infrastructure/"]

# Restore sạch
RUN dotnet restore "Services/Identity/Identity.API/Identity.API.csproj"

# Copy toàn bộ code
COPY . .

# --- DÒNG QUAN TRỌNG NHẤT: Xóa sạch mọi thư mục obj/bin bị lọt vào ---
# --- RUN find . -type d -name "obj" -exec rm -rf {} + ---
# --- RUN find . -type d -name "bin" -exec rm -rf {} + ---

WORKDIR "/src/Services/Identity/Identity.API"
# Chạy build và BẮT BUỘC phải restore lại vì ta vừa xóa obj
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Identity.API.dll"]