let app_url = "/"
if (process.env.NODE_ENV === "development") {
  app_url = "https://localhost:7080/"
}
export default app_url
