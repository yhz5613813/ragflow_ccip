import mermaid from 'mermaid';
import React from 'react';
// 修改 Mermaid 初始化配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',

  flowchart: {
    // useMaxWidth: true, // 自动宽度限制
    htmlLabels: true, // 允许HTML标签
  },
});
// 定义props类型接口
interface MermaidProps {
  chart: string;
}

export default class Mermaid extends React.Component<MermaidProps> {
  private containerRef = React.createRef<HTMLDivElement>();

  // 清理旧图表
  private cleanup() {
    if (this.containerRef.current) {
      const container = this.containerRef.current;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  }

  // 异步渲染
  private async renderMermaid() {
    this.cleanup();

    await new Promise((resolve) => setTimeout(resolve, 50)); // 等待 DOM 更新

    if (this.containerRef.current) {
      try {
        // 每次渲染时生成新的唯一 ID
        const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        const { svg } = await mermaid.render(uniqueId, this.props.chart);
        this.containerRef.current.innerHTML = svg;
      } catch (error) {
        console.error('Mermaid render error:', error);
        this.containerRef.current.textContent = this.props.chart;
      }
    }
  }

  componentDidMount() {
    this.renderMermaid();
  }

  componentDidUpdate(prevProps: MermaidProps) {
    if (this.props.chart !== prevProps.chart) {
      this.renderMermaid();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  render() {
    return (
      <div
        ref={this.containerRef}
        className="mermaid-container"
        role="img"
        aria-label="流程图"
        style={{
          minWidth: '50vw',
          overflow: 'auto',
          lineHeight: 'normal',
        }}
      />
    );
  }
}
