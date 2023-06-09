import router from './router'

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url)
		const secret = url.searchParams.get('secret')
		if (secret != env.SECRET_KEY) return new Response('401 Unauthorized', { status: 401 })

		return router.handle(request, env, ctx)

		return new Response('404 Not Found', { status: 404 })
	},
}
