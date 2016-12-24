#关联模块
目前现有关联模块有：关联项目、审批表单，客户，合同（其它关联待接入）

##使用

代码位置：`scripts/directives/appDirectives/linkModule.js`

###模版中引入directvie

####添加关联组件：
`<add-link-module link-modules="customer,project" data-related="related"></add-link-module>`
#####参数：
- link-modules:配置关联的模块
  - 必须。
  - 可选的模块有:[`project,customer,contract,approval`],多个选项使用`,`分隔
- data-related:关联模块的数据对象
  - 必须
  - 关联对象数据集合（须和同时使用的展示关联组件的related为同一对象）

####展示关联组件：
`<link-detail-list data-related="related" data-action="edit"></link-detail-list>`

- data-related：关联模块的数据对象
 - 关联对象数据集合（须和同时使用的添加关联组件的related为同一对象）
- data-action：组件模式
 - 只读模式(默认)和可编辑模式（`edit`）
