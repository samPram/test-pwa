'use client';

import {useEffect, useState} from "react";
import {Html5QrcodeScanner} from "html5-qrcode";
import type { Html5QrcodeScanner as Html5QrcodeScannerType } from 'html5-qrcode'
import {Tag, message, Empty, List, Button, FloatButton, Card, Modal, Input} from "antd";
import {
    DeleteOutlined, HomeOutlined,
    PlusOutlined,
    QrcodeOutlined,
    ScanOutlined,
    SettingOutlined,
    UserOutlined
} from "@ant-design/icons";

interface DataItem {
  id: number
  name: string
  code: string
  timestamp: string
}

interface ManualInput {
  name: string
  code: string
}

type ActiveTab = 'home' | 'qr' | 'profile' | 'settings'

export default function Home() {
  const [dataList, setDataList] = useState<DataItem[]>([
    {
      id: 1,
      name: 'Item Sample 1',
      code: 'SAMPLE001',
      timestamp: new Date().toLocaleString('id-ID')
    },
    {
      id: 2,
      name: 'Item Sample 2',
      code: 'SAMPLE002',
      timestamp: new Date().toLocaleString('id-ID')
    }
  ])
  const [activeTab, setActiveTab] = useState<ActiveTab>('home')
  const [isQRModalVisible, setIsQRModalVisible] = useState(false)
  const [isManualModalVisible, setIsManualModalVisible] = useState(false)
  const [manualInput, setManualInput] = useState<ManualInput>({ name: '', code: '' })
  const [scanner, setScanner] = useState<Html5QrcodeScannerType | null>(null)

  // Cleanup scanner on component unmount
  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear()
      }
    }
  }, [scanner])

  // Initialize QR Scanner
  const initQRScanner = () => {
    const html5QrCodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
    )

    html5QrCodeScanner.render(
        (decodedText: string) => {
          // Success callback
          addItemFromQR(decodedText)
          html5QrCodeScanner.clear()
          setIsQRModalVisible(false)
          message.success('QR Code berhasil dipindai!')
        },
        (error: string) => {
          // Error callback (optional)
          console.log('QR scan error:', error)
        }
    )

    setScanner(html5QrCodeScanner)
  }

  const addItemFromQR = (qrData: string) => {
    try {
      // Assume QR contains JSON or simple text
      let itemData: Partial<DataItem>
      try {
        itemData = JSON.parse(qrData)
      } catch {
        // If not JSON, treat as simple text
        itemData = { name: `QR Item ${Date.now()}`, code: qrData }
      }

      const newItem: DataItem = {
        id: Date.now(),
        name: itemData.name || `Item ${Date.now()}`,
        code: itemData.code || qrData,
        timestamp: new Date().toLocaleString('id-ID')
      }

      setDataList(prev => [newItem, ...prev])
    } catch (error) {
      message.error('Gagal memproses data QR')
    }
  }

  const addManualItem = () => {
    if (!manualInput.name || !manualInput.code) {
      message.error('Nama dan kode harus diisi')
      return
    }

    const newItem: DataItem = {
      id: Date.now(),
      name: manualInput.name,
      code: manualInput.code,
      timestamp: new Date().toLocaleString('id-ID')
    }

    setDataList(prev => [newItem, ...prev])
    setManualInput({ name: '', code: '' })
    setIsManualModalVisible(false)
    message.success('Item berhasil ditambahkan')
  }

  const deleteItem = (id: number) => {
    setDataList(prev => prev.filter(item => item.id !== id))
    message.success('Item berhasil dihapus')
  }

  const openQRModal = () => {
    setIsQRModalVisible(true)
    setTimeout(() => {
      initQRScanner()
    }, 100)
  }

  const closeQRModal = () => {
    if (scanner) {
      scanner.clear()
      setScanner(null)
    }
    setIsQRModalVisible(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-800">Data Items</h1>
                <Tag color="blue">{dataList.length} items</Tag>
              </div>

              {dataList.length === 0 ? (
                  <Empty
                      description="Belum ada data"
                      className="mt-8"
                  />
              ) : (
                  <List
                      className="bg-white rounded-lg"
                      dataSource={dataList}
                      renderItem={(item) => (
                          <List.Item
                              className="px-4"
                              actions={[
                                <Button
                                    key="delete"
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteItem(item.id)}
                                    size="small"
                                />
                              ]}
                          >
                            <List.Item.Meta
                                title={
                                  <div className="flex justify-between items-start">
                                    <span className="font-medium">{item.name}</span>
                                  </div>
                                }
                                description={
                                  <div className="space-y-1">
                                    <div className="text-blue-600 font-mono text-sm">{item.code}</div>
                                    <div className="text-gray-400 text-xs">{item.timestamp}</div>
                                  </div>
                                }
                            />
                          </List.Item>
                      )}
                  />
              )}

              {/* Floating Action Buttons */}
              <FloatButton.Group
                  trigger="hover"
                  type="primary"
                  style={{ right: 16, bottom: 80 }}
                  icon={<PlusOutlined />}
              >
                <FloatButton
                    icon={<ScanOutlined />}
                    tooltip="Scan QR Code"
                    onClick={openQRModal}
                />
                <FloatButton
                    icon={<PlusOutlined />}
                    tooltip="Tambah Manual"
                    onClick={() => setIsManualModalVisible(true)}
                />
              </FloatButton.Group>
            </div>
        )

      case 'qr':
        return (
            <div className="p-4">
              <h1 className="text-xl font-bold text-gray-800 mb-4">QR Scanner</h1>
              <Card className="text-center">
                <div className="py-8">
                  <QrcodeOutlined className="text-6xl text-blue-500 mb-4" />
                  <p className="text-gray-600 mb-4">Gunakan tombol scan untuk memindai QR code</p>
                  <Button
                      type="primary"
                      icon={<ScanOutlined />}
                      onClick={openQRModal}
                      size="large"
                  >
                    Mulai Scan
                  </Button>
                </div>
              </Card>
            </div>
        )

      case 'profile':
        return (
            <div className="p-4">
              <h1 className="text-xl font-bold text-gray-800 mb-4">Profile</h1>
              <Card>
                <div className="text-center py-8">
                  <UserOutlined className="text-6xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">User Profile</h3>
                  <p className="text-gray-500">Profile settings akan tersedia di sini</p>
                </div>
              </Card>
            </div>
        )

      case 'settings':
        return (
            <div className="p-4">
              <h1 className="text-xl font-bold text-gray-800 mb-4">Settings</h1>
              <Card>
                <div className="text-center py-8">
                  <SettingOutlined className="text-6xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">App Settings</h3>
                  <p className="text-gray-500">Pengaturan aplikasi akan tersedia di sini</p>
                </div>
              </Card>
            </div>
        )

      default:
        return null
    }
  }

  const navigationItems = [
    { key: 'home' as const, icon: HomeOutlined, label: 'Home' },
    { key: 'qr' as const, icon: QrcodeOutlined, label: 'QR' },
    { key: 'profile' as const, icon: UserOutlined, label: 'Profile' },
    { key: 'settings' as const, icon: SettingOutlined, label: 'Settings' }
  ]


  return (
      <div className="min-h-screen bg-gray-50 pb-16">
        {/* Main Content */}
        <main className="min-h-screen">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navigationItems.map(({ key, icon: Icon, label }) => (
                <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                        activeTab === key
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label={`Navigate to ${label}`}
                >
                  <Icon className="text-xl mb-1" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
            ))}
          </div>
        </nav>

        {/* QR Scanner Modal */}
        <Modal
            title="Scan QR Code"
            open={isQRModalVisible}
            onCancel={closeQRModal}
            footer={null}
            width="90%"
            style={{ maxWidth: 400 }}
        >
          <div className="text-center">
            <div id="qr-reader" className="w-full"></div>
            <p className="text-gray-500 text-sm mt-4">
              Arahkan kamera ke QR code untuk memindai
            </p>
          </div>
        </Modal>

        {/* Manual Input Modal */}
        <Modal
            title="Tambah Item Manual"
            open={isManualModalVisible}
            onCancel={() => {
              setIsManualModalVisible(false)
              setManualInput({ name: '', code: '' })
            }}
            onOk={addManualItem}
            okText="Tambah"
            cancelText="Batal"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Item
              </label>
              <Input
                  placeholder="Masukkan nama item"
                  value={manualInput.name}
                  onChange={(e) => setManualInput(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Item
              </label>
              <Input
                  placeholder="Masukkan kode item"
                  value={manualInput.code}
                  onChange={(e) => setManualInput(prev => ({ ...prev, code: e.target.value }))}
              />
            </div>
          </div>
        </Modal>
      </div>
  );
}
