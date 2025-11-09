import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json', // Get base64 instead of URL
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
