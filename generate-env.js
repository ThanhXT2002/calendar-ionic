const fs = require("fs");

// Đọc các biến môi trường
const apiKey = process.env.API_KEY || "";

// Tạo nội dung file environment.prod.ts
const envFileContent = `
export const environment = {
  production: true,
  apiKey: '${apiKey}',
};
`;

// Đảm bảo thư mục environments tồn tại
const dir = "./src/environments";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Ghi file environment.prod.ts
fs.writeFileSync("./src/environments/environment.prod.ts", envFileContent);
console.log("Environment file generated successfully.");

// Tạo thêm file environment.ts (nếu cần)
const devEnvFileContent = `
export const environment = {
  production: false,
  apiKey: '${apiKey}',
};
`;
fs.writeFileSync("./src/environments/environment.ts", devEnvFileContent);
console.log("Development environment file generated successfully.");
