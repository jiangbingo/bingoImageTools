/**
 * Vercel Edge Function for AI API calls
 *
 * 这个函数作为代理，隐藏真实的 API Key
 * 前端通过调用这个函数来使用 AI 服务
 *
 * 部署到 Vercel 后，在环境变量中配置：
 * - BIGMODEL_API_KEY (生产环境必需)
 */

interface AIRequest {
  service: 'gemini' | 'bigmodel';
  action: string;
  params: Record<string, any>;
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(request: Request): Promise<Response> {
  // 只允许 POST 请求
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' } as AIResponse, { status: 405 });
  }

  try {
    const { service, action, params }: AIRequest = await request.json();

    // 验证请求参数
    if (!service || !action) {
      return Response.json(
        { error: 'Missing required parameters' } as AIResponse,
        { status: 400 }
      );
    }

    // 根据服务类型调用相应的 API
    let result;
    switch (service) {
      case 'gemini':
        result = await callGeminiAPI(action, params);
        break;
      case 'bigmodel':
        result = await callBigModelAPI(action, params);
        break;
      default:
        return Response.json(
          { error: 'Invalid service' } as AIResponse,
          { status: 400 }
        );
    }

    return Response.json({ success: true, data: result } as AIResponse);
  } catch (error) {
    console.error('AI API Error:', error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      } as AIResponse,
      { status: 500 }
    );
  }
}

/**
 * 调用 Google Gemini API
 */
async function callGeminiAPI(action: string, params: Record<string, any>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  switch (action) {
    case 'removeBackground':
      return await geminiRemoveBackground(ai, params.image);
    case 'idPhoto':
      return await geminiIdPhoto(ai, params.image, params.color);
    case 'upscale':
      return await geminiUpscale(ai, params.image);
    case 'restorePhoto':
      return await geminiRestorePhoto(ai, params.image);
    case 'removeObject':
      return await geminiRemoveObject(ai, params.image, params.description);
    default:
      throw new Error(`Unknown Gemini action: ${action}`);
  }
}

/**
 * 调用智谱 AI API
 */
async function callBigModelAPI(action: string, params: Record<string, any>) {
  const apiKey = process.env.BIGMODEL_API_KEY;
  if (!apiKey) {
    throw new Error('BIGMODEL_API_KEY not configured');
  }

  const baseUrl = 'https://open.bigmodel.cn/api/paas/v4';

  switch (action) {
    case 'textToImage':
      return await bigmodelTextToImage(apiKey, baseUrl, params.prompt, params.size);
    case 'removeBackground':
      return await bigmodelRemoveBackground(apiKey, baseUrl, params.image);
    case 'idPhoto':
      return await bigmodelIdPhoto(apiKey, baseUrl, params.image, params.color);
    case 'upscale':
      return await bigmodelUpscale(apiKey, baseUrl, params.image);
    case 'restorePhoto':
      return await bigmodelRestorePhoto(apiKey, baseUrl, params.image);
    case 'removeObject':
      return await bigmodelRemoveObject(apiKey, baseUrl, params.image, params.description);
    default:
      throw new Error(`Unknown BigModel action: ${action}`);
  }
}

// ========== Gemini Helper Functions ==========

async function geminiCallAI(ai: any, prompt: string, base64Image: string, aspectRatio?: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt },
      ],
    },
    config: { imageConfig: { aspectRatio: (aspectRatio as any) || "1:1" } }
  });

  const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (!part?.inlineData) throw new Error('No image generated');
  return `data:image/png;base64,${part.inlineData.data}`;
}

async function geminiRemoveBackground(ai: any, image: string) {
  return geminiCallAI(
    ai,
    "Extract the main subject and remove everything else from the background. Output ONLY the subject with a pure transparent background.",
    image
  );
}

async function geminiIdPhoto(ai: any, image: string, color: string) {
  return geminiCallAI(
    ai,
    `Remove background and replace with solid ${color}. Perform light professional face retouching and center the subject for an ID photo.`,
    image,
    "3:4"
  );
}

async function geminiUpscale(ai: any, image: string) {
  return geminiCallAI(ai, "Upscale this image, enhance details, and remove noise.", image);
}

async function geminiRestorePhoto(ai: any, image: string) {
  return geminiCallAI(
    ai,
    "Restore this old photo: remove scratches, fix damages, sharpen blurry parts, and add natural colors if it's black and white.",
    image
  );
}

async function geminiRemoveObject(ai: any, image: string, description: string) {
  return geminiCallAI(
    ai,
    `Smartly remove "${description}" from this image and fill the gap seamlessly with surrounding background textures.`,
    image
  );
}

// ========== BigModel Helper Functions ==========

async function bigmodelFetch(apiKey: string, url: string, body: any) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`BigModel API Error: ${error}`);
  }

  return response.json();
}

async function bigmodelTextToImage(apiKey: string, baseUrl: string, prompt: string, size: string = '1024x1024') {
  const data = await bigmodelFetch(apiKey, `${baseUrl}/images/generations`, {
    model: 'cogview-3-flash',
    prompt,
    size,
  });

  if (!data.data?.[0]) {
    throw new Error('No image generated');
  }

  const result = data.data[0];
  if (result.b64_image) {
    return `data:image/png;base64,${result.b64_image}`;
  }
  if (result.url) {
    return result.url;
  }

  throw new Error('Invalid image response');
}

async function bigmodelGLM4V(apiKey: string, baseUrl: string, prompt: string, base64Image: string) {
  const data = await bigmodelFetch(apiKey, `${baseUrl}/chat/completions`, {
    model: 'glm-4v-flash',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: base64Image } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  });

  return data.choices[0]?.message?.content || '';
}

async function bigmodelRemoveBackground(apiKey: string, baseUrl: string, image: string) {
  const description = await bigmodelGLM4V(
    apiKey,
    baseUrl,
    '请详细描述这张图片中的主体（人物/物体），包括外观、姿态、表情等细节。不要描述背景。',
    image
  );

  return bigmodelTextToImage(
    apiKey,
    baseUrl,
    `${description}\n专业抠图效果，主体清晰，背景完全透明，PNG格式。`
  );
}

async function bigmodelIdPhoto(apiKey: string, baseUrl: string, image: string, color: string) {
  const colorMap: Record<string, string> = {
    white: '纯白色',
    '#3b82f6': '蓝色',
    '#ef4444': '红色',
  };

  const bgName = colorMap[color] || '白色';
  const description = await bigmodelGLM4V(
    apiKey,
    baseUrl,
    '请详细描述这张证件照中的人物，包括面部特征、发型、表情、服装等。',
    image
  );

  return bigmodelTextToImage(
    apiKey,
    baseUrl,
    `专业证件照，${description}，正面半身像，${bgName}背景，光线均匀，高清晰度，标准证件照比例 3:4`,
    '768x1024'
  );
}

async function bigmodelUpscale(apiKey: string, baseUrl: string, image: string) {
  const description = await bigmodelGLM4V(
    apiKey,
    baseUrl,
    '请详细描述这张图片的所有内容，包括主体、背景、色彩、构图、细节等。',
    image
  );

  return bigmodelTextToImage(
    apiKey,
    baseUrl,
    `${description}\n超高分辨率，4K画质，细节丰富，清晰锐利，专业摄影质感。`,
    '1536x1536'
  );
}

async function bigmodelRestorePhoto(apiKey: string, baseUrl: string, image: string) {
  const description = await bigmodelGLM4V(
    apiKey,
    baseUrl,
    '请详细描述这张老照片中的内容和场景。',
    image
  );

  return bigmodelTextToImage(
    apiKey,
    baseUrl,
    `修复后的照片：${description}\n去除划痕和污渍，修复破损，增强清晰度，如果是黑白则自然上色。保持原照片的真实感和年代感。`
  );
}

async function bigmodelRemoveObject(apiKey: string, baseUrl: string, image: string, description: string) {
  const sceneDescription = await bigmodelGLM4V(
    apiKey,
    baseUrl,
    '请详细描述这张图片的完整场景，包括主体、背景、环境布局等。',
    image
  );

  return bigmodelTextToImage(
    apiKey,
    baseUrl,
    `${sceneDescription}\n注意：图片中的"${description}"已被移除，该区域由周围背景自然填充，画面完整和谐，看不出移除痕迹。`
  );
}
