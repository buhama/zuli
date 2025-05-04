import { ToolInvocation, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

interface Message {
	role: 'user' | 'assistant';
	content: string;
	toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
	try {
		const { messages }: { messages: Message[] } = await req.json();

		console.log('messages', messages);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		console.log('parts', (messages[0] as any).parts);

		const result = streamText({
			model: google('gemini-2.0-flash'),
			system: 'You are a helpful assistant.',
			messages,
			tools: {
				getWeather: {
					description: 'Get the weather for a location',
					parameters: z.object({
						city: z.string().describe('The city to get the weather for'),
						unit: z
							.enum(['C', 'F'])
							.describe('The unit to display the temperature in'),
					}),
					execute: async ({ city, unit }) => {
						const weather = {
							value: 24,
							description: 'Sunny',
						};

						return `It is currently ${weather.value}°${unit} and ${weather.description} in ${city}!`;
					},
				},
			},
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error('Error processing request:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 501,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
