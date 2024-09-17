// src/app/api/proxy/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { eventLink, encryptedUsername, encryptedPassword, unixTimestamp } = body;
        const zeploToken = process.env.ZEPLO_TOKEN;

        // Send the POST request to the Zeplo API
        const response = await axios({
            method: 'POST',
            url: 'https://zeplo.to/auto-cg.vercel.app/api',
            params: {
                _token: zeploToken,
                _delay_until: unixTimestamp,
                _retry: 2, // allow up to 2 retries for failed attempts
            },
            data: {
                eventLink,
                encryptedUsername,
                encryptedPassword,
            },
        });

        return NextResponse.json(response.data);
    } catch (error) {
        return NextResponse.json(
            { error: `Error: ${error}` },
            { status: 500 }
        );
    }
}
