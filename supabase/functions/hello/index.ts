// Minimal smoke-test edge function — ZERO external imports.
// If `curl` against this returns "ok", the deploy pipeline is healthy and
// the issue with another function is in that function's code/imports.
//
// Deploy:  supabase functions deploy hello --no-verify-jwt
// Invoke:  curl -X POST https://<project-ref>.supabase.co/functions/v1/hello \
//            -H "apikey: <anon-key>" -H "Authorization: Bearer <anon-key>"

Deno.serve((_req) => {
    return new Response(
        JSON.stringify({
            ok: true,
            ts: new Date().toISOString(),
            runtime: "deno-edge",
        }),
        { headers: { "Content-Type": "application/json" } },
    );
});
