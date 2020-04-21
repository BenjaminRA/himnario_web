import React, { useEffect, useState, useRef } from 'react';
import { Layout, Menu, Select, Spin, PageHeader, Button, Divider } from 'antd'
import { ZoomOutOutlined, ZoomInOutlined, ColumnHeightOutlined } from '@ant-design/icons';
import classnames from 'classnames'
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
  const [fullHeight, setFullHeight] = useState(true)
  const [acordes, setAcordes] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [transpose, setTranspose] = useState(0)
  const acordesList = {
    latina : ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'],
    americana : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  };

  const fetchHimnos = async () => {
    const resHimnos = await fetch('http://104.131.104.212:8085/himnos/todos').then(res => res.json())
    setHimnos(resHimnos)
  }

  const fetchHimno = async (id) => {
    const resHimno = await fetch('http://104.131.104.212:8085/himnos/' + id).then(res => res.json())
    setHimno(resHimno)
    setAcordes(false)
    setSize(isBrowser ? 1.4 : 3.5)
    setTranspose(0)
    setCargando(false)
  }

  const hasChords = (coro) => {
    if (coro[0] === undefined || coro[0].acordes === null) return false
    const aux = coro[0].acordes.split('\n')
    for (let line of aux) {
      if (line === '') return false
    }
    return true
  }

  const fetchCoros = async () => {
    const resCoros = await fetch('http://104.131.104.212:8085/coros/todos').then(res => res.json())
    setHimnos(resCoros)
  }

  useEffect(() => {
    fetchHimnos()
  }, [])

  const onChange = (value) => {
    setId(value)
    setCargando(true)
    fetchHimno(value)
  }

  const toggleChords = () => {
    setAcordes(!acordes)
  }
  const togglefullHeight = () => {
    if (fullHeight) {
      document.body.style.overflowY = "auto" 
    } else {
      document.body.style.overflowY = "hidden"
    }
    setFullHeight(!fullHeight)
  }

  const zoomOut = () => {
    setSize(size - (isBrowser ? 0.15 : 0.5))
  }

  const zoomIn = () => {
    setSize(size + (isBrowser ? 0.15 : 0.5))
  }

  const tranposing = (value) => {
    setTranspose(transpose+value)
  }

  const clearSelections = () => {
    setId(0)
    setAcordes(false)
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

  const transposeTo = (value, original) => {
    if (value == 0) 
      return original;
    else if (value.isNegative)
      value = 12 + value;
    for(let i = 0; i < original.length; ++i) {
      let acordeStart = original[i].match('[A-Z]') === null ? -1 : original[i].match('[A-Z]').index ;
      while (acordeStart !== -1) {
        let acordeEnd = original[i].indexOf(' ', acordeStart) == -1 ? original[i].length : original[i].indexOf(' ', acordeStart);
        for(let j = acordesList['latina'].length - 1; j >= 0; --j) {
          if(original[i].substring(acordeStart, acordeEnd).indexOf(acordesList['latina'][j]) != -1) {
            let index = (j + value)%12 < 0 ? 12 + (j + value)%12 : (j + value)%12;
            original[i] = replace(original[i], acordeStart,  acordesList['latina'][j], acordesList['latina'][index])
            // original[i] = original[i].replace(acordesList['latina'][j], acordesList['latina'][index], acordeStart);
            break;
          }
        }

        acordeEnd = original[i].indexOf(' ', acordeStart) == -1 ? original[i].length : original[i].indexOf(' ', acordeStart);
        acordeStart = original[i].substring(acordeEnd).match('[A-Z]') === null ? -1 : original[i].substring(acordeEnd).match('[A-Z]').index + acordeStart;
      }
    }

    return original;
  }

  const replace = (string, acordeStart, searchValue, newValue) => {
    return string.substring(0, acordeStart) + string.substring(acordeStart).replace(searchValue, newValue)
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
              <Button onClick={() => tranposing(-1)} disabled={!hasChords(himno)}>-1</Button>,
              <Button onClick={toggleChords} disabled={!hasChords(himno)}>{acordes ? 'Ocultar' : 'Mostrar'} Acordes</Button>,
              <Button onClick={() => tranposing(1)} disabled={!hasChords(himno)}>+1</Button>,
              <Divider style={{backgroundColor: 'rgba(0, 0, 0, 0.2)', marginLeft: 20}} type="vertical"/>,
              <Button onClick={togglefullHeight}><ColumnHeightOutlined/></Button>,
              <Button onClick={zoomOut}><ZoomOutOutlined /></Button>,
              <Button onClick={zoomIn}><ZoomInOutlined /></Button>
            ]}
          >
          </PageHeader>
        </div>
      </BrowserView>
      <MobileView>
        <div className="info">
          <Button onClick={zoomOut}><ZoomOutOutlined /></Button>
          <Button onClick={() => tranposing(-1)} disabled={!hasChords(himno)}>-1</Button>
          <Button onClick={toggleChords} disabled={!hasChords(himno)}>{acordes ? 'Ocultar' : 'Mostrar'} Acordes</Button>
          <Button onClick={() => tranposing(1)} disabled={!hasChords(himno)}>+1</Button>
          <Button onClick={zoomIn}><ZoomInOutlined /></Button>
        </div>
      </MobileView>
      <Layout.Content className={classnames("himno-letra-container", {
        'full-height': fullHeight,
        'fixed-height': !fullHeight
      })} style={{
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
                    {parrafo.parrafo.split('\n').map((linea, index) => {
                      if (parrafo.coro) {
                        return <>
                          {acordes && hasChords(himno) ? <div className="acordes"><strong><i>{transposeTo(transpose, parrafo.acordes.split('\n'))[index]}</i></strong><br /></div> : <></>}
                          <i>{linea}</i><br />
                        </>
                      } else {
                        return <>
                          {acordes && hasChords(himno) ? <div className="acordes"><strong>{transposeTo(transpose, parrafo.acordes.split('\n'))[index]}</strong><br /></div> : <></>}
                          {linea}<br />
                        </>
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
