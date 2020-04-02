import React, { useEffect, useState, useRef } from 'react';
import { Layout, Menu, Select, Spin, PageHeader, Button } from 'antd'
import { ZoomOutOutlined, ZoomInOutlined } from '@ant-design/icons';
import './App.css';
import 'antd/dist/antd.css'
import {
  BrowserView,
  MobileView,
  isBrowser,
  isMobile
} from "react-device-detect";

function App() {
  const [coroMode, setCoroMode] = useState(false)
  const [himnos, setHimnos] = useState([])
  const [himno, setHimno] = useState([])
  const [id, setId] = useState(0)
  const [size, setSize] = useState(isBrowser ? 1.4 : 3.5)
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

  const fetchCoros = async () => {
    const resCoros = await fetch('http://104.131.104.212:8085/coros/todos').then(res => res.json())
    setHimnos(resCoros)
  }

  const fetchCoro = async (id) => {
    const resCoro = await fetch('http://104.131.104.212:8085/himnos/' + id).then(res => res.json())
    setHimno(resCoro)
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
    setSize(size - (isBrowser ? 0.15 : 0.5))
  }

  const zoomIn = () => {
    setSize(size + (isBrowser ? 0.15 : 0.5))
  }

  const clearSelections = () => {
    setId(0)
    setHimno([])
    setHimnos([])
  }

  const onHimnosClick = () => {
    setCoroMode(false)
    clearSelections()
    fetchHimnos()
  }

  const onCorosClick = () => {
    setCoroMode(true)
    clearSelections()
    fetchCoros()
  }

  return (
    <Layout>
      <Layout.Header>
        <div className="logo">
          <img src="./favicon.png" />
        </div>
        <BrowserView>
          <div
            style={{
              height: 'inherit',
              float: 'right'
            }}
          >
            <Select
              showSearch
              style={{ width: 500 }}
              value={id}
              placeholder={"Seleccione un " + (coroMode ? 'Coro' : 'Himno')}
              optionFilterProp="children"
              onChange={onChange}
              notFoundContent={himnos.length === 0 ? <Spin size="small" /> : null}
              filterOption={(input, option) => {
                if (coroMode) {
                  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                } else {
                  if (typeof (option.children) === 'string')
                    return false
                  return option.children.join(' ').toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              }
              }
            >
              <Select.Option disabled value={0} key="0" style={{
                display: 'none'
              }}>{"Seleccione un " + (coroMode ? 'Coro' : 'Himno')}</Select.Option>
              {
                coroMode ?
                  himnos.map(himno => {
                    return <Select.Option value={himno.id} key={himno.id}>{himno.titulo}</Select.Option>
                  })
                  : himnos.map(himno => {
                    return <Select.Option value={himno.id} key={himno.id}>{himno.id} - {himno.titulo}</Select.Option>
                  })
              }
            </Select>
          </div>
        </BrowserView>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
        >
          <Menu.Item key="1" onClick={onHimnosClick}>
            Himnos
          </Menu.Item>
          <Menu.Item key="2" onClick={onCorosClick}>
            Coros
          </Menu.Item>
        </Menu>
      </Layout.Header>
      <MobileView>
        <div className="select-mobile">
          <Select
            showSearch
            style={{ width: '90vw' }}
            value={id}
            placeholder={"Seleccione un " + (coroMode ? 'Coro' : 'Himno')}
            optionFilterProp="children"
            onChange={onChange}
            notFoundContent={himnos.length === 0 ? <Spin size="small" /> : null}
            filterOption={(input, option) => {
              if (coroMode) {
                return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              } else {
                if (typeof (option.children) === 'string')
                  return false
                return option.children.join(' ').toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            }
            }
          >
            <Select.Option disabled value={0} key="0" style={{
              display: 'none',
            }}>{"Seleccione un " + (coroMode ? 'Coro' : 'Himno')}</Select.Option>
            {
              coroMode ?
                himnos.map(himno => {
                  return <Select.Option value={himno.id} key={himno.id}>{himno.titulo}</Select.Option>
                })
                : himnos.map(himno => {
                  return <Select.Option value={himno.id} key={himno.id}>{himno.id} - {himno.titulo}</Select.Option>
                })
            }
          </Select>
        </div>
      </MobileView>
      <BrowserView>
        <div className="info">
          <PageHeader
            title={id === 0 ? '' : coroMode ? himnos[himnos.findIndex(element => element.id == id)].titulo : id + ' - ' + himnos[id - 1].titulo}
            extra={[
              <Button key="1" onClick={zoomOut}><ZoomOutOutlined /></Button>,
              <Button key="2" onClick={zoomIn}><ZoomInOutlined /></Button>
            ]}
          >
          </PageHeader>
        </div>
      </BrowserView>
      <MobileView>
        <div className="info">
          <Button key="1" onClick={zoomOut}><ZoomOutOutlined /></Button>
          <Button key="2" onClick={zoomIn}><ZoomInOutlined /></Button>
        </div>
      </MobileView>
      <Layout.Content className="himno-letra-container" style={{
        fontSize: size + 'vw',
      }}>
        {
          cargando ? <div className="center">
            <Spin />
          </div> : himno.length === 0 ? <div className="center">
            <p style={{
              fontSize: isBrowser ? '1.4vw' : '4vw'
            }}>
              Seleccione un {coroMode ? 'Coro' : 'Himno'}
            </p>
          </div> : <div className="parrafos">
                {himno.map((parrafo) =>
                  <p>
                    {parrafo.coro ? <><i>Coro:<br /></i></> : <></>}
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
