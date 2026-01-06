// https://kit.svelte.dev/docs/routing#server
import { transform_semantic_encoding } from '$lib/encoding/semantic_encoding'
import { json } from '@sveltejs/kit'

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals: { db }, url: { searchParams } }) {
	/** @type {string} */
	const raw_encoding = searchParams.get('raw_encoding') ?? ''
	
	const parsed_semantic_encoding = await transform_semantic_encoding(db, raw_encoding)
	return json({ parsed_semantic_encoding })
}
