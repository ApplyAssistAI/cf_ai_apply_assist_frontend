/**
 * Worker entry point - proxies resume processing requests to AWS Lambda
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/api/process-resume" && request.method === "POST") {
      try {
        const body = (await request.json()) as {
          resume_text: string;
          job_posting_url: string;
        };

        const response = await fetch(env.LAMBDA_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            secret: env.AWS_SECRET,
            resume_text: body.resume_text,
            job_posting_url: body.job_posting_url
          })
        });

        const data = await response.json();
        return Response.json(data);
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          { status: 500 }
        );
      }
    }

    return new Response("Not found", { status: 404 });
  }
} satisfies ExportedHandler<Env>;
