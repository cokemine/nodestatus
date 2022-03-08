import React, { FC, useMemo } from 'react';
import {
  Table,
  Tag,
  Typography
} from 'antd';
import useSWR from 'swr';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import Loading from '../components/Loading';
import type { IResp, Event as IEvent } from '../types';

const Incidents: FC = () => {
  const { data } = useSWR<IResp<IEvent[]>>('/api/event');
  const { Title } = Typography;
  const dataList = data?.data?.sort((x, y) => y.id - x.id);
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
    }
  ], []);
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
            />
          )
          : <Loading />
      }
    </>
  );
};

export default Incidents;
