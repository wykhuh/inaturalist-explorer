import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export function createMockServer() {
  const handlers = [
    http.get("https://api.inaturalist.org/v1*", async (_args) => {
      // console.log("request.url", _args.request.url);
      return HttpResponse.json({ id: "abc-123" });
    }),
    http.get("https://api.inaturalist.org/v2/observations*", async (_args) => {
      // console.log("request.url", _args.request.url);
      return HttpResponse.json({ total_results: 123, results: [] });
    }),
  ];

  const server = setupServer(...handlers);

  return server;
}
