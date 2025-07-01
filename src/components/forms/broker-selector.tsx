import React from 'react'
import { Building2, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Broker {
  id: string
  name: string
  description: string
  supportedFormats: string[]
  icon?: string
}

interface BrokerSelectorProps {
  brokers: Broker[]
  selectedBroker?: string
  onBrokerSelect: (brokerId: string) => void
  className?: string
}

const BrokerSelector: React.FC<BrokerSelectorProps> = ({
  brokers,
  selectedBroker,
  onBrokerSelect,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Select Your Broker
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brokers.map((broker) => (
          <div
            key={broker.id}
            className={cn(
              'card p-4 cursor-pointer transition-all hover:scale-105',
              selectedBroker === broker.id && 'ring-2 ring-profit bg-profit bg-opacity-10'
            )}
            onClick={() => onBrokerSelect(broker.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-surface-light">
                  <Building2 className="w-5 h-5 text-text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">{broker.name}</h4>
                  <p className="text-sm text-text-secondary">{broker.description}</p>
                </div>
              </div>
              {selectedBroker === broker.id && (
                <Check className="w-5 h-5 text-profit" />
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">Supported Formats:</p>
              <div className="flex flex-wrap gap-1">
                {broker.supportedFormats.map((format) => (
                  <span
                    key={format}
                    className="px-2 py-1 text-xs bg-surface-light text-text-secondary rounded"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BrokerSelector 