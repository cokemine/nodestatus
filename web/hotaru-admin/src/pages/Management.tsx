import React, {
  FC, ReactElement, Reducer, useCallback, useMemo, useState, useReducer
} from 'react';
import {
  Typography, Table, Tag, Modal, Input, Form, Switch, Button, AutoComplete,
  FormInstance
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
import { KeyedMutator } from 'swr/dist/types';
import { IResp, IServer } from '../types';
import { notify } from '../utils';
import Loading from '../components/Loading';

const { Title } = Typography;
countries.registerLocale(i18nZh);
countries.registerLocale(i18nEn);

type ActionType = {
  type: 'showModal' | 'showImportForm' | 'reverseSortEnabled' | 'resetState' | 'setInstallationScript' | 'setNode',
  payload?: {
    form?: FormInstance,
    mutate?: KeyedMutator<any>,
    installationScript?: string,
    currentNode?: string;
  }
};

const initialState = {
  currentNode: '',
  installationScript: '',
  showModal: false,
  sortEnabled: false,
  isImport: false
};

const reducer: Reducer<typeof initialState, ActionType> = (state, action) => {
  const {
    mutate,
    form,
    installationScript = '',
    currentNode = ''
  } = action.payload ?? {};
  switch (action.type) {
    case 'showModal':
      return {
        ...state,
        showModal: true
      };
    case 'reverseSortEnabled':
      return { ...state, sortEnabled: !state.sortEnabled };
    case 'setInstallationScript':
      return { ...state, installationScript };
    case 'showImportForm': {
      return { ...state, showModal: true, isImport: true };
    }
    case 'setNode':
      return {
        ...state,
        showModal: true,
        currentNode,
        installationScript
      };
    case 'resetState':
      mutate?.();
      form?.resetFields();
      return {
        ...state,
        currentNode: '',
        installationScript: '',
        showModal: false,
        isImport: false
      };
    default:
      throw new Error();
  }
};

const parseInstallationScript = (
  username: string,
  password: string
): string => {
  const protocol = document.location.protocol.replace('http', 'ws');
  const { host } = window.location;
  const dsn = `${protocol}//${username || 'USERNAME_YOU_SET'}:${password || 'PASSWORD_YOU_SET'}@${host}`;
  return `wget -N https://raw.githubusercontent.com/cokemine/nodestatus-client-go/master/install.sh && bash install.sh --dsn ${dsn}`;
};

const Management: FC = () => {
  const [regionResult, setRegionResult] = useState<string[]>([]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data, mutate } = useSWR<IResp<IServer[]>>('/api/servers');

  const [form] = Form.useForm<IServer & { password: string }>();
  const { confirm } = Modal;
  const dataSource = data?.data!;

  const handleModify = useCallback(() => {
    const data = form.getFieldsValue();
    axios.put<IResp>('/api/servers', { username: state.currentNode, data }).then(res => {
      notify('Success', res.data.msg, 'success');
      dispatch({ type: 'resetState', payload: { form, mutate } });
    });
  }, [state.currentNode, form, mutate]);

  const handleCreate = useCallback(() => {
    const data = form.getFieldsValue();
    axios.post<IResp>('/api/servers', { ...data }).then(res => {
      notify('Success', res.data.msg, 'success');
      dispatch({ type: 'resetState', payload: { form, mutate } });
    });
  }, [form, mutate]);

  const handleDelete = useCallback((username: string) => {
    axios.delete<IResp>(`/api/servers/${username}`).then(res => {
      notify('Success', res.data.msg, 'success');
      dispatch({ type: 'resetState', payload: { form, mutate } });
    });
  }, [form, mutate]);

  const handleSortOrder = useCallback((order: number[]) => {
    axios.put<IResp>('/api/servers/order', { order }).then(res => {
      notify('Success', res.data.msg, 'success');
      dispatch({ type: 'resetState', payload: { form, mutate } });
    });
  }, [form, mutate]);

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
      render(_, record) {
        return (
          <div className="flex justify-evenly items-center">
            <EditOutlined onClick={() => {
              form.setFieldsValue(record);
              dispatch({
                type: 'setNode',
                payload: {
                  currentNode: record.username,
                  installationScript: parseInstallationScript(record.username, '')
                }
              });
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
      <Button type="primary" className="mr-6" onClick={() => dispatch({ type: 'showModal' })}>New</Button>
      <Button
        type="primary"
        className="mr-6"
        onClick={() => dispatch({ type: 'showImportForm' })}
      >
        Import
      </Button>
      <Button
        type="primary"
        danger={state.sortEnabled}
        onClick={() => {
          if (state.sortEnabled) {
            const order = dataSource.map(item => item.id);
            order.reverse();
            handleSortOrder(order);
          }
          dispatch({ type: 'reverseSortEnabled' });
        }}
      >
        {!state.sortEnabled ? 'Sort' : 'Save'}
      </Button>
    </>
  ), [dataSource, handleSortOrder, state.sortEnabled]);

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
      <Draggable
        draggableId={props['data-row-key']?.toString()}
        index={index}
        isDragDisabled={!state.sortEnabled}
      >
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
  }, [dataSource, state.sortEnabled]);

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
              pagination={state.sortEnabled ? false : undefined}
              footer={TableFooter}
            />
            <Modal
              title={state.currentNode ? 'Modify Configuration' : 'New'}
              visible={state.showModal}
              onOk={state.currentNode ? handleModify : handleCreate}
              onCancel={() => dispatch({ type: 'resetState', payload: { form } })}
              className="top-12"
            >
              <Form
                layout="vertical"
                form={form}
                onValuesChange={(field, allFields) => {
                  if (field.username || field.password) {
                    dispatch({
                      type: 'setInstallationScript',
                      payload: {
                        installationScript: parseInstallationScript(
                          field.username || allFields.username,
                          field.password || allFields.password
                        )
                      }
                    });
                  }
                }}
              >
                {state.isImport ? (
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
                    <Form.Item label="Script">
                      <code
                        className="bg-gray-200 px-2 py-0.5 leading-6 rounded break-all"
                      >
                        {state.installationScript}
                      </code>
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
