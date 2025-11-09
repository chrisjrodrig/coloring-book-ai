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

    // Step 1: Use ChatGPT to enhance the prompt for coloring book generation
    console.log('Enhancing prompt with ChatGPT...');
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that converts user descriptions into optimized prompts for generating coloring book pages.

          Create a concise, clear prompt (max 100 words) that describes:
          - The main subject from the user's description
          - Black and white line art style
          - Simple, clean outlines suitable for coloring
          - No shading, gradients, or color fill

          Return ONLY the prompt text, no quotes or extra formatting.`,
        },
        {
          role: 'user',
          content: `Create a DALL-E prompt for a coloring book page: ${description}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const enhancedPrompt = chatCompletion.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      throw new Error('Failed to generate enhanced prompt');
    }

    // Clean the prompt: remove quotes and ensure it's within limits
    const cleanPrompt = enhancedPrompt
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Ensure the final prompt isn't too long (DALL-E 3 has a 4000 char limit)
    const finalPrompt = cleanPrompt.slice(0, 1000);

    console.log('Enhanced prompt:', finalPrompt);
    console.log('Prompt length:', finalPrompt.length);

    // Step 2: Use DALL-E to generate the coloring book image
    console.log('Generating image with DALL-E...');
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: finalPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = imageResponse.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    console.log('Image generated successfully');

    // Return the generated image URL and enhanced prompt
    return NextResponse.json({
      success: true,
      imageUrl,
      enhancedPrompt: finalPrompt,
      originalDescription: description,
    });
  } catch (error: any) {
    console.error('Error generating coloring book page:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
    });

    // Handle specific OpenAI errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (error?.status === 400) {
      return NextResponse.json(
        { error: `Invalid request: ${error?.message || 'Bad request to OpenAI API'}` },
        { status: 400 }
      );
    }

    // Return more detailed error for debugging
    return NextResponse.json(
      { error: error?.message || 'Failed to generate coloring book page' },
      { status: 500 }
    );
  }
}
