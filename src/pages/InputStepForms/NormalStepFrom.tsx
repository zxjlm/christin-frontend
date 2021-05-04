import { Card, message, Modal, Space } from 'antd';
import {
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
  StepsForm,
} from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import { waitTime } from '@/utils/useful';
import { knowledgeExtract } from '@/services/site-data/api';
import type { annotationType, labelType } from '@/components/SingleAnnotation';
import AnnotationCard from '@/components/SingleAnnotation/index';
// import { useState } from 'react';
// import type { MyAPI } from '@/services/site-data/typings';
import { useModel } from '@@/plugin-model/useModel';
import { useState } from 'react';

export default ({
  visible,
  setVisible,
}: {
  visible: boolean;
  setVisible: (props: boolean) => void;
}) => {
  const [labels, setLabels] = useState<labelType[]>([]);
  // @ts-ignore
  const { nerDocs, setNerDocs } = useModel('nerDocs', (model) => ({
    nerDocs: model.nerDocs,
    setNerDocs: model.setNerDocs,
  }));

  const stopOneFinish = async (formData: any) => {
    knowledgeExtract(formData).then((response) => {
      setNerDocs(response.nerDocs);
      setLabels(response.labels);
    });
    return true;
  };

  const stopTwoFinish = async () => {
    // console.log(docs)
  };

  return (
    <StepsForm
      onFinish={async (values) => {
        // eslint-disable-next-line no-console
        console.log(values);
        await waitTime(1000);
        setVisible(false);
        message.success('提交成功');
      }}
      formProps={{
        validateMessages: {
          required: '此项为必填项',
        },
      }}
      stepsFormRender={(dom, submitter) => {
        return (
          <Modal
            title="分步表单"
            width={1000}
            onCancel={() => setVisible(false)}
            visible={visible}
            footer={submitter}
            destroyOnClose
          >
            {dom}
          </Modal>
        );
      }}
    >
      <StepsForm.StepForm name="dataInput" title="数据录入" onFinish={stopOneFinish}>
        <div style={{ marginLeft: '30px' }}>
          <ProFormText
            name="project-name"
            label="项目名称"
            width="md"
            tooltip="最长为 24 位，用于标定的唯一 id"
            placeholder="请输入项目名称"
            rules={[{ required: true }]}
          />
          <ProFormTextArea
            name="project-description"
            label="项目描述"
            width="lg"
            placeholder="请输入项目描述(250字以内)"
          />
        </div>
        <ProCard
          tabs={{
            type: 'card',
          }}
        >
          <ProCard.TabPane key="tab1" tab="手动输入">
            <ProFormTextArea
              name="message"
              label="分析内容"
              width="lg"
              initialValue={
                '近一周饮食不当,一度腹泻,日3次,泻下后精神疲烦,时有低热,怕风,口干,痰中夹有血丝,左侧胸痛时作'
              }
              placeholder="请输入分析内容"
            />
          </ProCard.TabPane>
          <ProCard.TabPane key="tab2" tab="从Excel或CSV导入">
            <ProFormUploadDragger
              max={4}
              name="excel-or-csv-file"
              title={'从Excel或CSV导入'}
              description={'数据列名指定为"data"'}
              accept={'.csv,.xls,.xlsx'}
              action={'/main/api/v2/extract_from_table_file'}
            />
          </ProCard.TabPane>
          <ProCard.TabPane key="tab3" tab="从文本文件导入">
            <ProFormUploadDragger
              max={4}
              name="text-file"
              title={'从文本文件导入'}
              accept={'.txt'}
              action={'/main/api/v2/extract_from_text'}
            />
          </ProCard.TabPane>
        </ProCard>
      </StepsForm.StepForm>
      <StepsForm.StepForm name="knowledgeResult" title="抽取结果" onFinish={stopTwoFinish}>
        <Card>
          <Space direction="vertical">
            {nerDocs.map(
              (doc: { annotations: annotationType[]; text: string }, list_id: number) => (
                <Card
                  type="inner"
                  key={Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER))}
                >
                  <AnnotationCard
                    labels={labels}
                    // annotationsDefault={doc.annotations}
                    text={doc.text}
                    list_id={list_id}
                  />
                </Card>
              ),
            )}
          </Space>
        </Card>
      </StepsForm.StepForm>
      <StepsForm.StepForm name="buildGraph" title="构建图数据库"></StepsForm.StepForm>
      <StepsForm.StepForm name="buildResult" title="图数据库构建结果"></StepsForm.StepForm>
    </StepsForm>
  );
};
