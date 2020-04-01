import React, { useEffect, useState } from 'react';
import { Layout, Menu, Select, Spin, PageHeader, Button } from 'antd'
import { ZoomOutOutlined, ZoomInOutlined } from '@ant-design/icons';
import './App.css';
import 'antd/dist/antd.css'

function App() {
  const [himnos, setHimnos] = useState([])
  const [himno, setHimno] = useState([])
  const [id, setId] = useState(0)
  const [size, setSize] = useState(1.4)
  const [cargando, setCargando] = useState(false)

  const fetchHimnos = async () => {
    const resHimnos = await fetch('http://104.131.104.212:8085/himnos/todos').then(res => res.json())
    setHimnos(resHimnos)
  }
  
  const fetchHimno = async (id) => {
    const resHimno = await fetch('http://104.131.104.212:8085/himnos/' + id).then(res => res.json())
    setHimno(resHimno)
    setCargando(false)
  }

  useEffect(() => {
    fetchHimnos()
  }, [])

  const onChange = (value) => {
    setId(value)
    setCargando(true)
    fetchHimno(value)
  }

  const zoomOut = () => {
    setSize(size-0.15)
  }

  const zoomIn = () => {
    setSize(size+0.15)
  }

  return (
    <Layout>
      <Layout.Header>
        <div className="logo">
          <img src="./favicon.png" />
        </div>
        <div
          style={{
            height: 'inherit',
            float: 'right'
          }}
        >
          <Select
            showSearch
            style={{ width: 500 }}
            placeholder="Seleccione un Himno"
            optionFilterProp="children"
            onChange={onChange}
            notFoundContent={himnos.length === 0 ? <Spin size="small" /> : null}
            filterOption={(input, option) => {
              return option.children.join(' ').toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            }
          >
            {himnos.map(himno => {
              return <Select.Option value={himno.id} key={himno.id}>{himno.id} - {himno.titulo}</Select.Option>
            })}
          </Select>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
        >
          <Menu.Item key="1">
            Himnos
          </Menu.Item>
          {/* <Menu.Item key="2">
            Coros
          </Menu.Item> */}
        </Menu>
      </Layout.Header>
      <div className="info">
        <PageHeader
          title={id === 0 ? '' : himnos[id-1].titulo}
          extra={[
            <Button key="1" onClick={zoomOut}><ZoomOutOutlined/></Button>,
            <Button key="2" onClick={zoomIn}><ZoomInOutlined/></Button>
          ]}
        >
        </PageHeader>
      </div>
      <Layout.Content className="himno-letra-container" style={{
        fontSize: size + 'vw'
      }}>
        {
          cargando ? <div className="center">
            <Spin />
          </div> : himno.length === 0 ? <div className="center">
            <p style={{
              fontSize: '1.4vw'
            }}>
              Seleccione un Himno
            </p>
          </div> : <div className="parrafos">
              {himno.map((parrafo) =>
                <p>
                  {parrafo.coro ? <><i>Coro:<br/></i></> : <></>} 
                  {parrafo.parrafo.split('\n').map((linea) => {
                    if (parrafo.coro) {
                      return <><i>{linea}</i><br /></>
                    } else {
                      return <>{linea}<br /></>
                    }
                  })}
                </p>
              )}
            </div>
        }
      </Layout.Content>
    </Layout>
  );
}

export default App;
