# Technology Stack

## Project Type

Stagewise网页微调插件是一个现代化的前端Vue3组件库/工具，通过Vite构建系统提供可视化网页元素调试功能。它是一个可集成的前端组件，支持离线环境使用，提供实时的CSS样式调试和预览能力。

## Core Technologies

### Primary Language(s)
- **Language**: TypeScript 4.9+
- **Runtime**: 浏览器环境 (支持现代浏览器)
- **Language-specific tools**: Vite构建工具、Vue3框架、TypeScript编译器

### Key Dependencies/Libraries
- **Vue 3**: 响应式UI框架，提供组件化开发
- **html2canvas**: 网页截图功能，通过npm包管理
- **TypeScript**: 类型安全和开发体验
- **Vite**: 现代化构建工具，支持热更新
- **原生DOM API**: 元素选择、样式操作、事件处理

### Application Architecture

**架构模式**: Vue3组件化架构
- **核心组件**: 配置管理组件、UI交互组件、样式处理组件、截图功能组件
- **响应式系统**: 基于Vue3的响应式数据管理
- **组合式API**: 使用Composition API进行逻辑复用
- **非侵入式**: 不影响宿主页面的原有功能

### Data Storage
- **Primary storage**: localStorage (用户配置、历史记录)
- **Caching**: Vue3响应式缓存 (选中元素状态、样式快照)
- **Data formats**: JSON (配置文件、样式数据)

### External Integrations
- **APIs**: 无外部API依赖，支持完全离线使用
- **Protocols**: 本地文件系统访问
- **Authentication**: 无需认证，纯前端工具

### Monitoring & Dashboard Technologies
- **Dashboard Framework**: Vue 3 + TypeScript
- **Real-time Communication**: Vue3响应式系统和自定义事件
- **Visualization Libraries**: 自实现的元素高亮和选择器组件
- **State Management**: Vue3 Composition API状态管理

## Development Environment

### Build & Development Tools
- **Build System**: Vite 4.0+ (快速构建和热更新)
- **Package Management**: pnpm (高效的包管理器)
- **Development workflow**: Vite开发服务器 + 热模块替换(HMR)

### Code Quality Tools
- **Static Analysis**: ESLint + TypeScript编译器检查
- **Formatting**: Prettier (代码格式化)
- **Testing Framework**: Vitest (支持非浏览器环境单元测试) + Vue Test Utils
- **Documentation**: TypeScript类型定义 + Markdown文档

### Version Control & Collaboration
- **VCS**: Git
- **Branching Strategy**: 功能分支开发
- **Code Review Process**: Pull Request审查

### Dashboard Development
- **Live Reload**: Vite HMR热模块替换
- **Port Management**: Vite开发服务器端口配置
- **Multi-Instance Support**: 支持多页面同时开发和使用

## Deployment & Distribution
- **Target Platform(s)**: 现代Web浏览器 (Chrome, Firefox, Safari, Edge)
- **Distribution Method**: 
  - pnpm包管理器发布
  - npm registry分发
  - 构建后的静态资源
- **Installation Requirements**: 
  - 现代浏览器支持
  - 支持ES2020+语法
  - Vue3运行时环境
- **Update Mechanism**: pnpm包版本管理和自动更新

## Technical Requirements & Constraints

### Performance Requirements
- **响应时间**: 元素选择响应 < 100ms
- **内存使用**: 占用内存 < 15MB (包含Vue3运行时)
- **启动时间**: 组件初始化 < 300ms
- **兼容性**: 不影响宿主页面性能

### Compatibility Requirements
- **Platform Support**: 
  - Chrome 88+
  - Firefox 78+
  - Safari 14+
  - Edge 88+
- **Dependency Versions**: 
  - Vue 3.3+
  - TypeScript 4.9+
  - Vite 4.0+
  - html2canvas 1.4.1+
- **Standards Compliance**: ES2020+, DOM Level 2+, CSS3

### Security & Compliance
- **Security Requirements**: 
  - 无外部数据传输
  - 本地存储加密(可选)
  - XSS防护
  - CSP兼容性
- **Compliance Standards**: 遵循Web安全最佳实践
- **Threat Model**: 防止恶意代码注入和数据泄露

### Scalability & Reliability
- **Expected Load**: 单页面使用，支持复杂Vue应用
- **Availability Requirements**: 99.9%可用性(依赖浏览器环境)
- **Growth Projections**: 支持大型Vue项目和复杂组件树

## Technical Decisions & Rationale

### Decision Log

1. **Vue3 + TypeScript架构选择**: 
   - **原因**: 提供类型安全、组件化开发和现代化开发体验
   - **权衡**: 增加了学习成本，但提升了代码质量和维护性

2. **Vite构建系统**: 
   - **原因**: 快速的开发体验、原生ES模块支持、优秀的TypeScript集成
   - **权衡**: 相比Webpack生态较新，但性能优势明显

3. **pnpm包管理**: 
   - **原因**: 节省磁盘空间、更快的安装速度、严格的依赖管理
   - **权衡**: 团队需要统一包管理器，但性能收益显著

4. **离线优先设计**: 
   - **原因**: 支持内网环境、提高可靠性、减少外部依赖
   - **权衡**: 包体积稍大，但保证了可用性

5. **Vitest测试框架**: 
   - **原因**: 与Vite深度集成、支持非浏览器环境、TypeScript原生支持
   - **权衡**: 生态相对较新，但开发体验优秀

6. **Composition API**: 
   - **原因**: 更好的逻辑复用、TypeScript支持、代码组织
   - **权衡**: 学习曲线，但长期维护性更好

## Known Limitations

- **浏览器兼容性**: 不支持IE浏览器，需要现代浏览器环境
- **Vue版本依赖**: 需要Vue3环境，与Vue2项目不兼容
- **构建复杂度**: 相比单文件方案，构建配置更复杂
- **包体积**: 包含Vue3运行时，体积相对较大
- **移动端支持**: 触摸操作体验需要进一步优化
- **SSR支持**: 当前主要针对客户端渲染，SSR支持有限

### 技术债务
- **测试覆盖率**: 需要完善单元测试和集成测试覆盖
- **性能优化**: 大量DOM操作需要虚拟化和优化
- **国际化**: 多语言支持需要完善
- **文档完整性**: API文档和TypeScript类型定义需要完善
- **插件系统**: 可扩展的插件架构需要设计和实现