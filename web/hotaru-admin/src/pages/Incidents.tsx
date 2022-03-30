import React, { FC, useCallback, useMemo } from 'react';
import {
  Table,
  Tag,
  Typography,
  Modal,
  Button
} from 'antd';
import useSWR from 'swr';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import Loading from '../components/Loading';
import { notify } from '../utils';
import type { IResp, Event as IEvent } from '../types';

const Incidents: FC = () => {
  const { data, mutate } = useSWR<IResp<IEvent[]>>('/api/event');
  const { Title } = Typography;
  const dataList = data?.data?.sort((x, y) => y.id - x.id);

  const handleDeleteEvent = useCallback((id: number) => {
    axios.delete<IResp>(`/api/event/${id}`).then(res => {
      notify('Success', res.data.msg, 'success');
      return mutate();
    });
  }, [mutate]);

  const columns: ColumnsType<IEvent> = useMemo(() => [
    {
      title: 'SERVER',
      dataIndex: 'server',
      render(_, record) {
        return record.username;
      }
    },
    {
      title: 'TYPE',
      dataIndex: 'type',
      render() {
        return <Tag color="error">DOWN</Tag>;
      }
    },
    {
      title: 'RESOLVED',
      dataIndex: 'resolved',
      render(resolved) {
        return resolved
          ? <Tag color="success">Resolved</Tag>
          : <Tag color="error">Unresolved</Tag>;
      }
    },
    {
      title: 'CreatedAt',
      dataIndex: 'created_at',
      render(createdAt) {
        return dayjs(createdAt).format('YYYY-MM-DD hh:mm');
      }
    },
    {
      title: 'ResolvedAt',
      dataIndex: 'updated_at',
      render(updatedAt, record) {
        return record.resolved ? dayjs(updatedAt).format('YYYY-MM-DD hh:mm') : '';
      }
    },
    {
      title: 'ACTION',
      dataIndex: 'action',
      align: 'center',
      render(_, record) {
        return (
          <Button
            danger
            onClick={() => Modal.confirm({
              title: 'Are you sure you want to delete this item?',
              icon: <ExclamationCircleOutlined />,
              onOk: () => handleDeleteEvent(record.id)
            })}
          >
            Delete
          </Button>
        );
      }
    }
  ], [handleDeleteEvent]);

  const Footer = useCallback(() => (
    <div>
      <Button
        type="primary"
        danger
        onClick={() => Modal.confirm({
          title: 'Are you sure you want to delete all items?',
          icon: <ExclamationCircleOutlined />,
          onOk: () => axios.delete('/api/event').then(res => {
            notify('Success', res.data.msg, 'success');
            return mutate();
          })
        })}
      >
        Delete All
      </Button>
    </div>
  ), [mutate]);

  return (
    <>
      <Title level={2} className="my-6 text-3xl">Incident History</Title>
      {
        dataList
          ? (
            <Table
              className="rounded-lg max-w-full"
              dataSource={dataList}
              columns={columns}
              footer={Footer}
              rowKey="id"
            />
          )
          : <Loading />
      }
    </>
  );
};

export default Incidents;
