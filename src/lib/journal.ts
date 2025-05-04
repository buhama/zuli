import { createClient } from '@/lib/supabase/client';
import { Journal } from '@/models/Journal';

const supabase = createClient();

export const upsert_journal = async (journal: Journal) => {
	const { data, error } = await supabase.from('journals').upsert(journal);

	if (error) {
		throw error;
	}

	return data;
};
