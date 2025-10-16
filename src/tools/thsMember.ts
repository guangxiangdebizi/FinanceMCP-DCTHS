import { TushareClient } from "../utils/tushareClient.js";

/**
 * 同花顺概念板块成分
 * 接口：ths_member
 * 描述：获取同花顺概念板块成分列表
 */
export const thsMember = {
  name: "get_ths_member",
  description: "获取同花顺概念板块成分股列表。可查询指定板块的成分股，或查询指定股票所属的板块。",
  parameters: {
    type: "object",
    properties: {
      ts_code: {
        type: "string",
        description: "板块指数代码（如 885823.TI），查询该板块包含的成分股"
      },
      con_code: {
        type: "string",
        description: "股票代码（如 000001.SZ），查询该股票所属的板块"
      }
    },
    required: []
  },

  async run(args: { 
    ts_code?: string; 
    con_code?: string;
  }, token?: string) {
    try {
      const client = new TushareClient(token);

      const params: Record<string, any> = {};
      if (args.ts_code) params.ts_code = args.ts_code;
      if (args.con_code) params.con_code = args.con_code;

      const data = await client.call("ths_member", params);
      const formattedData = client.formatData(data);

      if (!formattedData || formattedData.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `📊 同花顺板块成分查询结果\n\n暂无数据`
          }]
        };
      }

      let resultText = `📊 同花顺概念板块成分查询结果\n\n`;
      
      if (args.ts_code) {
        resultText += `板块代码：${args.ts_code}\n`;
        resultText += `成分股数量：${formattedData.length}\n\n`;
      } else if (args.con_code) {
        resultText += `股票代码：${args.con_code}\n`;
        resultText += `所属板块数量：${formattedData.length}\n\n`;
      }
      
      const displayData = formattedData.slice(0, 50);
      resultText += `显示前 ${displayData.length} 条：\n\n`;
      
      displayData.forEach((item, index) => {
        resultText += `### ${index + 1}. ${item.con_name || ""} (${item.con_code || ""})\n`;
        resultText += `- **指数代码**: ${item.ts_code}\n`;
        resultText += `- **成分代码**: ${item.con_code}\n`;
        resultText += `- **成分名称**: ${item.con_name}\n`;
        if (item.weight) resultText += `- **权重**: ${item.weight}\n`;
        if (item.in_date) resultText += `- **纳入日期**: ${item.in_date}\n`;
        if (item.is_new) resultText += `- **是否最新**: ${item.is_new}\n`;
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
          text: `❌ 查询失败\n\n错误信息：${error.message}\n\n请检查：\n1. Tushare Token 是否正确配置\n2. 板块代码或股票代码格式是否正确\n3. 是否有该接口的访问权限（需5000积分）`
        }],
        isError: true
      };
    }
  }
};

