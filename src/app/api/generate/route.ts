import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  console.log('=== API Route Called ===');
  console.log('Timestamp:', new Date().toISOString());

  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { description } = body;

    if (!description || typeof description !== 'string') {
      console.log('ERROR: Invalid description', { description, type: typeof description });
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('ERROR: OpenAI API key not found in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    console.log('OpenAI API key found:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client initialized successfully');

    // Clean and sanitize user input
    const sanitizedDescription = description
      .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .slice(0, 200); // Limit description length

    console.log('Sanitized description:', sanitizedDescription);

    // Create a simple, direct prompt using a template we control
    const dallePrompt = `A simple black and white line drawing coloring book page of ${sanitizedDescription}. The image should be in a coloring book style with clear black outlines, no shading, no colors, and plenty of white space for coloring.`;

    console.log('DALL-E prompt:', dallePrompt);
    console.log('Prompt length:', dallePrompt.length);

    // Generate the coloring book image with DALL-E
    console.log('Generating image with DALL-E...');
    const imageResponse = await client.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
    });

    const b64Image = imageResponse.data?.[0]?.b64_json;

    if (!b64Image) {
      throw new Error('Failed to generate image');
    }

    console.log('Image generated successfully');
    console.log('Image data length:', b64Image.length);

    // Return the generated image as base64 data
    return NextResponse.json({
      success: true,
      imageData: b64Image, // base64 image data
      enhancedPrompt: dallePrompt,
      originalDescription: description,
    });
  } catch (error: any) {
    console.error('Error generating coloring book page:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));

    // Log additional error details
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data,
      });
    }

    // Handle specific OpenAI errors
    if (error?.status === 401 || error?.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error?.status === 429 || error?.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.status === 400 || error?.response?.status === 400) {
      const errorMessage = error?.error?.message || error?.message || 'Bad request to OpenAI API';
      console.error('400 Error message:', errorMessage);
      return NextResponse.json(
        { error: `Invalid request: ${errorMessage}` },
        { status: 400 }
      );
    }

    // Return more detailed error for debugging
    const errorMessage = error?.error?.message || error?.message || 'Failed to generate coloring book page';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
