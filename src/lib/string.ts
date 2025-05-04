export const getRandomId = (limit?: number): string => {
	const bytes = crypto.getRandomValues(new Uint8Array(16));

	// Convert bytes to hexadecimal strings, ensuring two characters for each byte
	const hexBytes = Array.from(bytes, (byte) =>
		byte.toString(16).padStart(2, '0')
	);

	const formatUuid = (parts: string[]) =>
		[
			parts.slice(0, 4).join(''),
			parts.slice(4, 6).join(''),
			parts.slice(6, 8).join(''),
			parts.slice(8, 10).join(''),
			parts.slice(10, 16).join(''),
		].join('-');

	// Ensure conformity to UUID v4 by setting specific bits
	hexBytes[6] = ((parseInt(hexBytes[6], 16) & 0x0f) | 0x40).toString(16); // Set the 13th char to '4'
	hexBytes[8] = ((parseInt(hexBytes[8], 16) & 0x3f) | 0x80).toString(16); // Set the 17th char to one of [8, 9, A, or B]

	if (limit) return formatUuid(hexBytes).slice(0, limit);

	return formatUuid(hexBytes);
};
