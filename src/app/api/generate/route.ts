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

          Coloring book pages should be:
          - Black and white line art only
          - Simple, clean outlines
          - No shading or gradients
          - Clear, bold lines
          - Appropriate white space for coloring
          - Child-friendly and fun

          Take the user's description and create a detailed DALL-E prompt that will generate a perfect coloring book page.`,
        },
        {
          role: 'user',
          content: `Create a DALL-E prompt for a coloring book page based on this description: "${description}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const enhancedPrompt = chatCompletion.choices[0]?.message?.content;

    if (!enhancedPrompt) {
      throw new Error('Failed to generate enhanced prompt');
    }

    console.log('Enhanced prompt:', enhancedPrompt);

    // Step 2: Use DALL-E to generate the coloring book image
    console.log('Generating image with DALL-E...');
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${enhancedPrompt}. IMPORTANT: Create this as a black and white line drawing suitable for a coloring book, with clear outlines and no shading or color fill.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'natural',
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
      enhancedPrompt,
      originalDescription: description,
    });
  } catch (error: any) {
    console.error('Error generating coloring book page:', error);

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

    return NextResponse.json(
      { error: error?.message || 'Failed to generate coloring book page' },
      { status: 500 }
    );
  }
}
