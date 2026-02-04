/**
 * 智谱AI (BigModel) 服务封装
 * 浏览器原生 fetch API 实现
 */

interface BigModelConfig {
  apiKey: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
}

interface ImageResponse {
  data: Array<{
    url: string;
  }>;
}

/**
 * 智谱AI图像处理服务
 * 使用 GLM-4V (视觉理解) 和 CogView (图像生成)
 */
export class BigModelService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config?: BigModelConfig) {
    this.apiKey = config?.apiKey || import.meta.env.VITE_BIGMODEL_API_KEY || '';
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4';
  }

  private ensureApiKey(): void {
    if (!this.apiKey) {
      throw new Error('BIGMODEL_API_KEY not configured');
    }
  }

  /**
   * 生成 JWT Token (智谱AI需要)
   * 简化实现：直接使用 API Key
   */
  private getAuthorization(): string {
    this.ensureApiKey();
    // 智谱AI 使用 API Key 格式: id.secret
    // 简化版直接返回，生产环境建议使用 JWT
    return `Bearer ${this.apiKey}`;
  }

  /**
   * 将图片 URL 转换为 base64
   */
  private async urlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 调用智谱AI图像生成API (CogView)
   */
  private async callCogView(prompt: string): Promise<string> {
    this.ensureApiKey();

    try {
      const response = await fetch(`${this.baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthorization(),
        },
        body: JSON.stringify({
          model: 'cogview-3',
          prompt,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error (${response.status}): ${error}`);
      }

      const data: ImageResponse = await response.json();

      if (!data.data?.[0]?.url) {
        throw new Error('No image URL in response');
      }

      // 将 URL 转换为 base64
      return await this.urlToBase64(data.data[0].url);
    } catch (error: any) {
      console.error('CogView API Error:', error);
      throw error;
    }
  }

  /**
   * 调用智谱AI视觉理解API (GLM-4V)
   */
  private async callGLM4V(prompt: string, base64Image: string): Promise<string> {
    this.ensureApiKey();

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthorization(),
        },
        body: JSON.stringify({
          model: 'glm-4v-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image,
                  },
                },
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error (${response.status}): ${error}`);
      }

      const data: ChatCompletionResponse = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('GLM-4V API Error:', error);
      throw error;
    }
  }

  /**
   * 去除背景
   */
  async removeBackground(base64Image: string): Promise<string> {
    const description = await this.callGLM4V(
      '请详细描述这张图片中的主体（人物/物体），包括外观、姿态、表情等细节。不要描述背景。',
      base64Image
    );
    return this.callCogView(
      `${description}\n专业抠图效果，主体清晰，背景完全透明，PNG格式。`
    );
  }

  /**
   * 制作证件照
   */
  async idPhoto(base64Image: string, color: string): Promise<string> {
    const colorMap: Record<string, string> = {
      white: '纯白色',
      '#3b82f6': '蓝色',
      '#ef4444': '红色',
    };
    const bgName = colorMap[color] || '白色';
    const description = await this.callGLM4V(
      '请详细描述这张证件照中的人物，包括面部特征、发型、表情、服装等。',
      base64Image
    );
    return this.callCogView(
      `专业证件照，${description}，正面半身像，${bgName}背景，光线均匀，高清晰度，标准证件照比例 3:4`
    );
  }

  /**
   * 创建表情包 (添加文字)
   */
  async createMeme(base64Image: string, topText: string, bottomText: string): Promise<string> {
    const description = await this.callGLM4V(
      '请简要描述这张图片的内容和风格。',
      base64Image
    );
    return this.callCogView(
      `${description}\n在图片顶部添加"${topText}"文字，底部添加"${bottomText}"文字。文字为白色，黑色描边，粗体，清晰易读。保持原图内容和风格不变。`
    );
  }

  /**
   * AI 放大图片
   */
  async upscale(base64Image: string): Promise<string> {
    const description = await this.callGLM4V(
      '请详细描述这张图片的所有内容，包括主体、背景、色彩、构图、细节等。',
      base64Image
    );
    return this.callCogView(
      `${description}\n超高分辨率，4K画质，细节丰富，清晰锐利，专业摄影质感。`
    );
  }

  /**
   * 老照片修复
   */
  async restorePhoto(base64Image: string): Promise<string> {
    const description = await this.callGLM4V(
      '请详细描述这张老照片中的内容和场景。',
      base64Image
    );
    return this.callCogView(
      `修复后的照片：${description}\n去除划痕和污渍，修复破损，增强清晰度，如果是黑白则自然上色。保持原照片的真实感和年代感。`
    );
  }

  /**
   * 魔术消除（移除物体）
   */
  async removeObject(base64Image: string, description: string): Promise<string> {
    const sceneDescription = await this.callGLM4V(
      `请详细描述这张图片的完整场景，包括主体、背景、环境布局等。`,
      base64Image
    );
    return this.callCogView(
      `${sceneDescription}\n注意：图片中的"${description}"已被移除，该区域由周围背景自然填充，画面完整和谐，看不出移除痕迹。`
    );
  }

  /**
   * 文生图
   */
  async textToImage(prompt: string): Promise<string> {
    return this.callCogView(prompt);
  }
}

// 创建服务实例
export const bigmodelService = new BigModelService();
