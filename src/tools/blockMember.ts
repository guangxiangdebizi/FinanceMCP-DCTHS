import { TushareClient } from "../utils/tushareClient.js";

/**
 * 板块成分工具
 * 支持东财和同花顺两种数据源
 */
export const blockMember = {
  name: "get_block_member",
  description: "获取板块成分股数据。支持选择东财（DongCai）或同花顺（TongHuaShun）数据源。",
  parameters: {
    type: "object",
    properties: {
      ts_code: {
        type: "string",
        description: "股票代码（如 000001.SZ 或 600000.SH）"
      },
      block_code: {
        type: "string",
        description: "板块代码（如 BK0001）"
      },
      data_source: {
        type: "string",
        enum: ["dongcai", "tonghuashun"],
        description: "数据源选择：dongcai（东财）或 tonghuashun（同花顺）"
      }
    },
    required: ["data_source"]
  },

  async run(args: { 
    ts_code?: string; 
    block_code?: string; 
    data_source: "dongcai" | "tonghuashun" 
  }, token?: string) {
    try {
      // 参数验证
      if (!args.data_source) {
        throw new Error("数据源 data_source 是必填参数，请选择 'dongcai' 或 'tonghuashun'");
      }

      // 初始化 Tushare 客户端
      const client = new TushareClient(token);

      // 根据数据源选择 API
      let apiName: string;
      if (args.data_source === "dongcai") {
        apiName = "dc_bk_member";
      } else if (args.data_source === "tonghuashun") {
        apiName = "ths_bk_member";
      } else {
        throw new Error("无效的数据源，请选择 'dongcai' 或 'tonghuashun'");
      }

      // 构建查询参数
      const params: Record<string, any> = {};
      if (args.ts_code) params.ts_code = args.ts_code;
      if (args.block_code) params.block_code = args.block_code;

      // 调用 API
      const data = await client.call(apiName, params);
      const formattedData = client.formatData(data);

      if (!formattedData || formattedData.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `📊 板块成分查询结果\n\n数据源：${args.data_source === "dongcai" ? "东财" : "同花顺"}\n\n暂无数据`
          }]
        };
      }

      // 格式化输出
      let resultText = `📊 板块成分查询结果\n\n`;
      resultText += `数据源：${args.data_source === "dongcai" ? "东财" : "同花顺"}\n`;
      
      if (args.block_code) {
        resultText += `板块代码：${args.block_code}\n`;
        resultText += `成分股数量：${formattedData.length}\n\n`;
      } else if (args.ts_code) {
        resultText += `股票代码：${args.ts_code}\n`;
        resultText += `所属板块数量：${formattedData.length}\n\n`;
      } else {
        resultText += `查询全部板块成分\n`;
        resultText += `数据量：${formattedData.length}\n\n`;
      }
      
      // 显示前50条数据
      const displayData = formattedData.slice(0, 50);
      resultText += `显示前 ${displayData.length} 条：\n\n`;
      
      displayData.forEach((item, index) => {
        resultText += `### ${index + 1}. ${item.name || item.ts_code || item.block_code || ""}\n`;
        Object.entries(item).forEach(([key, value]) => {
          resultText += `- **${key}**: ${value}\n`;
        });
        resultText += `\n`;
      });

      return {
        content: [{
          type: "text" as const,
          text: resultText
        }]
      };

    } catch (error: any) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ 查询失败\n\n错误信息：${error.message}\n\n请检查：\n1. Tushare Token 是否正确配置\n2. 股票代码或板块代码格式是否正确\n3. 是否有该接口的访问权限`
        }],
        isError: true
      };
    }
  }
};

