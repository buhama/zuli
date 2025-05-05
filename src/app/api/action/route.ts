import { ToolInvocation, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { Reminder } from '@/models/Reminder';
import { getRandomId } from '@/lib/string';
import { getTodaysDate } from '@/lib/date/date';

interface Message {
	role: 'user' | 'assistant';
	content: string;
	toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
	const supabase = await createClient();
	try {
		const { messages }: { messages: Message[] } = await req.json();

		const newAssistantMessage: Message = {
			role: 'assistant',
			content: [
				'You are a virtual assistant for the user.',
				'The user is journaling and it is your job to take their entries and take action on their behalf.',
				'You will take the latest journal entry and take one of the actions that you are given,',
				'or take no action if you determine that no action is needed',
			].join(' '),
		};

		messages.unshift(newAssistantMessage);

		const result = streamText({
			model: google('gemini-2.0-flash'),
			system: 'You are a helpful assistant.',
			messages,
			tools: {
				addReminder: {
					description:
						'Based on the journal entry determine if a reminder needs to be added then return the reminder. Return nothing if no reminder is to be added.',
					parameters: z.object({
						title: z.string().describe('Title of the reminder'),
						description: z.string().describe('Description of the reminder'),
					}),
					execute: async ({ title, description }) => {
						const { data: userData, error: userError } =
							await supabase.auth.getUser();

						if (userError || !userData?.user) {
							throw new Error('User not found');
						}

						const newReminder: Reminder = {
							id: getRandomId(),
							title,
							description,
							created_at: getTodaysDate(),
							updated_at: getTodaysDate(),
							completed_at: null,
							user_id: userData.user.id,
						};

						const { data: reminderData, error: reminderError } = await supabase
							.from('reminders')
							.insert(newReminder)
							.select()
							.single<Reminder>();

						if (reminderError) {
							throw new Error('Error adding reminder');
						}

						return reminderData;
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
