import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { createClient } from '@/lib/supabase/server';
import { Journal } from '@/models/Journal';
import { redirect } from 'next/navigation';
import React from 'react';

const TodayPage = async () => {
	const supabase = await createClient();

	const { data: userData, error: userError } = await supabase.auth.getUser();

	if (userError || !userData?.user) {
		redirect('/login');
	}

	const { data: journalData, error: journalError } = await supabase
		.from('journals')
		.select('*')
		.eq('user_id', userData.user.id)
		.eq('date', new Date().toISOString().split('T')[0])
		.maybeSingle<Journal>();

	if (journalError) {
		console.error(journalError);
		return <div>Error loading journal</div>;
	}

	const journal = journalData;

	console.log('userData', userData);

	return <SimpleEditor initialContent={journal} user_id={userData.user.id} />;
};

export default TodayPage;
