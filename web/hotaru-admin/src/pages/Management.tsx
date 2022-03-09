import React, {
  FC, ReactElement, useCallback, useMemo, useState
} from 'react';
import {
  Typography, Table, Tag, Modal, Input, Form, Switch, Button, AutoComplete
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined, EditOutlined, ExclamationCircleOutlined, MenuOutlined
} from '@ant-design/icons';
import axios from 'axios';
import useSWR from 'swr';
import { arrayMoveImmutable } from 'array-move';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import countries from 'i18n-iso-countries';
import i18nZh from 'i18n-iso-countries/langs/zh.json';
import i18nEn from 'i18n-iso-countries/langs/en.json';
import { IResp, IServer } from '../types';
import { notify } from '../utils';
import Loading from '../components/Loading';

const { Title } = Typography;
countries.registerLocale(i18nZh);
countries.registerLocale(i18nEn);

const Management: FC = () => {
  const [modifyVisible, setModifyVisible] = useState<boolean>(false);
  const [currentNode, setCurrentNode] = useState<string>('');
  const [multiImport, setMultiImport] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState(false);
  const [shouldPagination, setShouldPagination] = useState<false | undefined>(undefined);
  const [regionResult, setRegionResult] = useState<string[]>([]);
  const { data, mutate } = useSWR<IResp<IServer[]>>('/api/server');

  const [form] = Form.useForm();
  const { confirm } = Modal;
  const dataSource = data?.data!;

  const resetStatus = useCallback((fetch = true) => {
    fetch && mutate();
    form.resetFields();
    setCurrentNode('');
    setMultiImport(false);
    setModifyVisible(false);
  }, [form, mutate]);

  const handleModify = useCallback(() => {
    const data = form.getFieldsValue();
    axios.put<IResp>('/api/server', { username: currentNode, data }).then(res => {
      notify('Success', res.data.msg, 'success');
      resetStatus();
    });
  }, [currentNode, form, resetStatus]);

  const handleCreate = useCallback(() => {
    const data = form.getFieldsValue();
    axios.post<IResp>('/api/server', { ...data }).then(res => {
      notify('Success', res.data.msg, 'success');
      resetStatus();
    });
  }, [form, resetStatus]);

  const handleDelete = useCallback((username: string) => {
    axios.delete<IResp>(`/api/server/${username}`).then(res => {
      notify('Success', res.data.msg, 'success');
      resetStatus();
    });
  }, [resetStatus]);

  const handleSortOrder = useCallback((order: number[]) => {
    axios.put<IResp>('/api/server/order', { order }).then(res => {
      notify('Success', res.data.msg, 'success');
      resetStatus();
    });
  }, [resetStatus]);

  const columns = useMemo<ColumnsType<IServer>>(() => [
    {
      title: 'SORT',
      dataIndex: 'sort',
      width: 30,
      align: 'center',
      render: () => undefined
    },
    {
      title: 'SERVER',
      dataIndex: 'server',
      align: 'center',
      // eslint-disable-next-line react/display-name
      render(_, record) {
        return (
          <div className="flex items-center text-sm">
            <svg viewBox="0 0 100 100" className="mr-3 block h-12 w-12">
              <use xlinkHref={`#${record.region}`} />
            </svg>
            <div className="whitespace-nowrap">
              <p className="font-semibold">{record.name}</p>
              <p className="text-left text-xs text-gray-600">{record.location}</p>
            </div>
          </div>
        );
      }
    },
    {
      title: 'USERNAME',
      dataIndex: 'username',
      align: 'center'
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      align: 'center'
    },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      align: 'center'
    },
    {
      title: 'REGION',
      dataIndex: 'region',
      align: 'center'
    },
    {
      title: 'STATUS',
      dataIndex: 'disabled',
      align: 'center',
      // eslint-disable-next-line react/display-name
      render: disabled => (
        disabled
          ? <Tag color="error">Disabled</Tag>
          : <Tag color="success">Enabled</Tag>
      )
    },
    {
      title: 'ACTION',
      dataIndex: 'action',
      align: 'center',
      // eslint-disable-next-line react/display-name
      render(_, record) {
        return (
          <div className="flex justify-evenly items-center">
            <EditOutlined onClick={() => {
              form.setFieldsValue(record);
              setCurrentNode(record.username);
              setModifyVisible(true);
            }}
            />
            <DeleteOutlined onClick={() => confirm({
              title: 'Are you sure you want to delete this item?',
              icon: <ExclamationCircleOutlined />,
              onOk: () => handleDelete(record.username)
            })}
            />
          </div>
        );
      }
    }

  ], [confirm, form, handleDelete]);

  const TableFooter = useCallback(() => (
    <>
      <Button type="primary" className="mr-6" onClick={() => setModifyVisible(true)}>New</Button>
      <Button
        type="primary"
        className="mr-6"
        onClick={() => {
          setMultiImport(true);
          setModifyVisible(true);
        }}
      >
        Import
      </Button>
      <Button
        type="primary"
        danger={sortOrder}
        onClick={() => {
          if (sortOrder) {
            const order = dataSource.map(item => item.id);
            order.reverse();
            handleSortOrder(order);
          }
          setSortOrder(val => !val);
          setShouldPagination(val => (val === undefined ? false : undefined));
        }}
      >
        {!sortOrder ? 'Sort' : 'Save'}
      </Button>
    </>
  ), [dataSource, handleSortOrder, sortOrder]);

  const DraggableContainer = useCallback<FC>(props => (
    <Droppable droppableId="table">
      {
        provided => (
          <tbody {...props} {...provided.droppableProps} ref={provided.innerRef}>
            {props.children}
            {provided.placeholder}
          </tbody>
        )
      }
    </Droppable>
  ), []);

  const DraggableBodyRow = useCallback<FC<any>>(props => {
    const index = dataSource.findIndex(x => x.id === props['data-row-key']);
    return (
      <Draggable draggableId={props['data-row-key']?.toString() || 'k'} index={index} isDragDisabled={!sortOrder}>
        {provided => {
          const children = props.children?.map?.((el: ReactElement) => {
            if (el.props.dataIndex === 'sort') {
              const props = el.props ? { ...el.props } : {};
              props.render = () => (
                <MenuOutlined
                  style={{ cursor: 'grab', color: '#999' }}
                  {...provided.dragHandleProps}
                />
              );
              return React.cloneElement(el, props);
            }
            return el;
          }) || props.children;
          return (
            <tr {...props} {...provided.draggableProps} ref={provided.innerRef}>
              {children}
            </tr>
          );
        }}
      </Draggable>
    );
  }, [dataSource, sortOrder]);

  return (
    <>
      <Title level={2} className="my-6">Management</Title>
      {
        data ? (
          <DragDropContext
            onDragEnd={result => {
              const { destination, source } = result;
              if (!destination) return;
              if (destination.droppableId === source.droppableId && destination.index === source.index) return;
              const newDataSource = arrayMoveImmutable(dataSource, source.index, destination.index);
              mutate({ ...data, data: newDataSource }, false).then();
            }}
          >
            <Table
              dataSource={dataSource}
              columns={columns}
              rowKey="id"
              components={{
                body: {
                  wrapper: DraggableContainer,
                  row: DraggableBodyRow
                }
              }}
              pagination={shouldPagination}
              footer={TableFooter}
            />
            <Modal
              title={currentNode ? 'Modify Configuration' : 'New'}
              visible={modifyVisible}
              onOk={currentNode ? handleModify : handleCreate}
              onCancel={() => resetStatus(false)}
            >
              <Form layout="vertical" form={form}>
                {multiImport ? (
                  <Form.Item label="Data" name="data">
                    <Input.TextArea rows={4} />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item label="Username" name="username">
                      <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password">
                      <Input.Password placeholder="留空不修改" />
                    </Form.Item>
                    <Form.Item label="Name" name="name">
                      <Input />
                    </Form.Item>
                    <Form.Item label="Type" name="type">
                      <Input />
                    </Form.Item>
                    <Form.Item label="Location" name="location">
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Region"
                      name="region"
                      rules={[{
                        validator(_, value) {
                          if (countries.isValid(value)) return Promise.resolve();
                          return Promise.reject(new Error('Country not found!'));
                        }
                      }]}
                    >
                      <AutoComplete
                        options={regionResult.map(value => ({
                          value,
                          label: value
                        }))}
                        onChange={value => {
                          const code = countries.getAlpha2Code(value, 'zh');
                          const codeEn = countries.getAlpha2Code(value, 'en');
                          return setRegionResult([code, codeEn].filter(v => !!v));
                        }}
                      >
                        <Input />
                      </AutoComplete>
                    </Form.Item>
                    <Form.Item label="Disabled" name="disabled" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </>
                )}
              </Form>
            </Modal>
          </DragDropContext>
        )
          : <Loading />
      }
    </>
  );
};

export default Management;
