# Fit3D CLI 使用说明

## 测试解析器功能

### 1. 测试GPX文件解析
```bash
pnpm run test-parser gpx test-data/sample.gpx
```

### 2. 测试FIT文件解析
```bash
pnpm run test-parser fit test-data/sample.fit
```

### 3. 比较两个文件
```bash
pnpm run test-parser compare test-data/sample.gpx test-data/sample.fit
```

## 主要CLI功能

### 1. 导入文件
```bash
pnpm run cli-simple import test-data/sample.gpx
pnpm run cli-simple import test-data/sample.fit -t cycling
```

### 2. 列出活动
```bash
pnpm run cli-simple list
```

### 3. 生成地图
```bash
pnpm run cli-simple map test-data/sample.gpx -s terrain
```

### 4. 生成3D视频
```bash
pnpm run cli-simple 3d test-data/sample.fit -t cycling
```

## 解析结果说明

### GPX文件解析结果
- **距离**: 使用Haversine公式计算真实距离
- **时长**: 从时间戳计算实际运动时长
- **爬升**: 计算最高海拔和最低海拔的差值
- **轨迹点**: 提取所有GPS坐标点

### FIT文件解析结果
- **距离**: 使用Haversine公式计算真实距离
- **时长**: 从记录时间计算实际运动时长
- **爬升**: 计算高程变化
- **心率**: 平均和最大心率
- **速度**: 平均和最大速度
- **功率**: 平均和最大功率
- **踏频**: 平均和最大踏频

## 数据验证

现在解析器可以正确提取：
- ✅ 真实的GPS坐标
- ✅ 准确的距离计算
- ✅ 正确的时长计算
- ✅ 准确的海拔数据
- ✅ 完整的运动统计信息

## 测试建议

1. **使用测试文件**: 先用`test-data/`目录中的示例文件测试
2. **验证数据**: 检查解析出的距离、时长、海拔是否合理
3. **比较结果**: 使用`compare`命令比较不同文件的解析结果
4. **检查轨迹**: 查看轨迹点坐标是否正确

## 故障排除

如果解析结果不正确：
1. 检查文件格式是否正确
2. 确认文件没有损坏
3. 查看控制台错误信息
4. 使用测试文件验证解析器功能
