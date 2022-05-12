import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo
} from 'react';
import {
  Col, Row, Typography, Table, Tag
} from 'antd';
import { ColumnsType } from 'antd/es/table';

import { BiServer } from 'react-icons/bi';
import { AiFillWarning } from 'react-icons/ai';
import { HiOutlineStatusOnline } from 'react-icons/hi';
import { parseUptime } from '@nodestatus/web-utils/shared';
import StateCard from '../components/StateCard';
import RoundIcon from '../components/RoundIcon';
import { StatusContext } from '../context/StatusContext';

import { ITable } from '../types';
import MapChart from '../components/MapChart';

const { Title } = Typography;

const Dashboard: FC = () => {
  const { servers, timeSince } = useContext(StatusContext);
  const [count, setCount] = useState({ online: 0, record: {} });

  useEffect(() => {
    let online = 0;
    const record: Record<string, number> = {};
    const add = (key: string) => {
      if (typeof record[key] === 'undefined') {
        record[key] = 0;
      }
      record[key]++;
    };
    for (const item of servers) {
      if (item.status) online++;
      add(item.region);
    }
    setCount({
      online, record
    });
  }, [servers]);

  const columns: ColumnsType<ITable> = useMemo(() => [
    {
      title: 'SERVER',
      dataIndex: 'server',
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
      title: 'STATUS',
      dataIndex: 'status',
      align: 'center',
      render: status => (
        status
          ? <Tag color="success">Online</Tag>
          : <Tag color="error">Offline</Tag>
      )
    },
    {
      title: 'UPTIME',
      dataIndex: 'uptime',
      align: 'center',
      render(uptime) {
        return uptime === '-' ? '-' : parseUptime(uptime);
      }
    },
    {
      title: 'LOAD',
      dataIndex: 'load',
      align: 'center'
    }
  ], []);

  const TableFooter = useCallback(() => (
    <span className="text-xs">
      最后更新：
      {timeSince}
    </span>
  ), [timeSince]);

  return (
    <>
      <Title level={2} className="my-6 text-3xl">Dashboard</Title>
      <Row gutter={32} className="mb-4">
        <Col xs={{ span: 24 }} lg={{ span: 12 }} className="flex items-center mb-4 xs:mb-0">
          <MapChart count={count.record} />
        </Col>
        <Col xs={{ span: 24 }} lg={{ span: 12 }}>
          <Row>
            <Col xs={{ span: 24 }} className="mb-4">
              <StateCard
                title="Servers Total"
                count={servers.length}
                icon={(
                  <RoundIcon
                    icon={BiServer}
                    iconColorClass="text-yellow-500"
                    bgColorClass="bg-yellow-100"
                  />
                )}
              />
            </Col>
            <Col xs={{ span: 24 }} className="mb-4">
              <StateCard
                title="Servers Online"
                count={count.online}
                icon={(
                  <RoundIcon
                    icon={HiOutlineStatusOnline}
                    iconColorClass="text-green-500"
                    bgColorClass="bg-green-100"
                  />
                )}
              />
            </Col>
            <Col xs={{ span: 24 }}>
              <StateCard
                title="Servers Offline"
                count={servers.length - count.online}
                icon={(
                  <RoundIcon
                    icon={AiFillWarning}
                    iconColorClass="text-blue-500"
                    bgColorClass="bg-blue-100"
                  />
                )}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Table
        className="rounded-lg max-w-full"
        dataSource={servers}
        columns={columns}
        footer={TableFooter}
        rowKey="id"
      />
    </>
  );
};

export default Dashboard;
