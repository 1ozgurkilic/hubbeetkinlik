'use client'

import { useState, useEffect, useRef } from 'react'
import { startOfWeek, format, addWeeks, subWeeks, isSameDay, addDays, startOfToday } from 'date-fns'
import { tr } from 'date-fns/locale'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { Plus, Camera, X, Calendar as CalIcon, LayoutGrid, Palette, ChevronLeft, ChevronRight, Hash } from 'lucide-react'
import { toPng } from 'html-to-image'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import clsx from 'clsx'

// Types
interface Event {
  id: number
  title: string
  start: string
  end?: string
  color?: string
  categoryId?: number
}

interface Category {
  id: number
  name: string
  color: string
}

const HOURS = [18, 19, 20, 21, 22, 23]

export default function DashboardPage() {
  const { theme } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  
  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "" | "other">("")

  const calendarRef = useRef<HTMLDivElement>(null)

  // Fetch data
  useEffect(() => {
    fetchEvents()
    fetchCategories()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch (e) { console.error(e) }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          setCategories(data)
          return
        }
      }
      // Fallback presets if API is empty
      setCategories([
        { id: 101, name: 'Sandalye Kapmaca', color: '#FF7043' },
        { id: 102, name: 'Günah Keçisi', color: '#81C784' },
        { id: 103, name: 'Çatlayan Buzdan Kaç', color: '#4FC3F7' },
        { id: 104, name: 'Düşen Yumurtalar', color: '#FFD54F' },
        { id: 105, name: 'Taş-Kağıt-Makas', color: '#BA68C8' },
        { id: 106, name: 'Karoları Eşle', color: '#FF8A80' },
        { id: 107, name: 'Balon Oyunu', color: '#AED581' }
      ])
    } catch (e) { console.error(e) }
  }

  // Calendar Grid Generation
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Monday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // DnD Logic
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const eventId = Number(active.id)
      const overId = over.id as string
      
      if (overId.includes('|')) {
        const [dayStr, hourStr] = overId.split('|')
        const newHour = parseInt(hourStr)
        const targetDate = new Date(dayStr)
        targetDate.setHours(newHour, 0, 0, 0)

        // Optimistic update
        setEvents(prev => prev.map(ev => 
          ev.id === eventId ? { ...ev, start: targetDate.toISOString() } : ev
        ))

        // API Call
        await fetch('/api/events', {
          method: 'PUT',
          body: JSON.stringify({ id: eventId, start: targetDate.toISOString() }),
          headers: { 'Content-Type': 'application/json' }
        })
      }
    }
  }


  const handleScreenshot = async () => {
    if (!calendarRef.current) return
    try {
      const dataUrl = await toPng(calendarRef.current, {
        cacheBust: true,
        style: {
          borderRadius: '2rem',
          padding: '20px',
          background: getComputedStyle(document.documentElement).getPropertyValue('--background')
        }
      })

      const link = document.createElement('a')
      link.download = `hubbe-takvim-${format(currentDate, 'yyyy-MM-dd')}.png`
      link.href = dataUrl
      link.click()
    } catch (e) { console.error('Screenshot failed', e) }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handleAddEvent triggered', { newEventTitle, newEventDate, selectedCategoryId })
    
    if (!newEventDate) {
      alert('Lütfen tarih seçiniz.')
      return
    }

    // Determine final title more robustly
    let finalTitle = newEventTitle
    if (!finalTitle && selectedCategoryId && selectedCategoryId !== 'other') {
      const cat = categories.find(c => c.id === Number(selectedCategoryId))
      if (cat) finalTitle = cat.name
    }

    console.log('Resolved title:', finalTitle)

    if (!finalTitle) {
      alert('Lütfen etkinlik adı giriniz.')
      return
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({ 
          title: finalTitle, 
          start: newEventDate,
          categoryId: (selectedCategoryId === 'other' || selectedCategoryId === '' || Number(selectedCategoryId) > 100) ? null : Number(selectedCategoryId) 
        }),
        headers: { 'Content-Type': 'application/json' }
      })
      
      console.log('API Response status:', res.status)
      
      if (res.ok) {
        fetchEvents()
        setShowModal(false)
        setNewEventTitle('')
        setSelectedCategoryId('')
      } else if (res.status === 401) {
        alert('Oturumunuz sona ermiş. Lütfen tekrar giriş yapınız.')
        window.location.href = '/login'
      } else {
        const err = await res.json().catch(() => ({ error: 'Bilinmeyen sunucu hatası.' }))
        console.error('API Error details:', err)
        alert(`Sunucu Hatası: ${err.error || 'Etkinlik eklenemedi.'} ${err.details ? '\nDetay: ' + JSON.stringify(err.details) : ''}`)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      alert(`Bağlantı Hatası: ${err instanceof Error ? err.message : 'Sunucuya ulaşılamadı.'}`)
    }
  }

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1))
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  return (
    <div className="font-sans min-h-screen bg-[var(--background)] text-[var(--foreground)] p-4 md:p-8 select-none flex flex-col gap-6 transition-colors duration-300">
      
      {/* Top Header Bar */}
      <div className="bg-[var(--card)] border-4 border-[var(--border)] rounded-[1.5rem] p-4 flex flex-col md:flex-row items-center justify-between shadow-[8px_8px_0px_var(--border)] relative z-30 transition-all hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_var(--border)]">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
           <div className="w-14 h-14 bg-[#E53935] border-3 border-[var(--border)] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_var(--border)]">
             <CalIcon className="w-8 h-8 text-white rotate-3" />
           </div>
           <div>
             <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight uppercase leading-none">Etkinlik Takvimi</h1>
             <p className="text-xs font-bold text-[#FFB300] uppercase tracking-widest mt-1">Hubbe Web Panel v2.0</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <div className="h-10 w-[2px] bg-[var(--border)]/10 mx-1 hidden md:block"></div>
          <button onClick={handleScreenshot} className="p-3 bg-[#81C784] border-2 border-[var(--border)] rounded-xl hover:bg-[#66BB6A] hover:scale-105 transition-all shadow-[3px_3px_0px_var(--border)] text-white">
             <Camera className="w-5 h-5"/>
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-[#FF7043] border-2 border-[var(--border)] rounded-xl text-white font-black shadow-[4px_4px_0px_var(--border)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--border)] transition-all uppercase text-sm">
             <Plus className="w-5 h-5"/> Etkinlik Ekle
          </button>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="bg-[var(--card)] border-4 border-[var(--border)] rounded-[2rem] p-6 shadow-[12px_12px_0px_var(--border)] flex-1 flex flex-col overflow-hidden relative" ref={calendarRef}>
        
        {/* Navigation Controls & Title */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 items-center justify-between gap-4 mb-6">
           {/* Left: Arrows */}
           <div className="flex items-center gap-2 bg-[var(--accent)]/10 p-1.5 rounded-2xl border-2 border-[var(--border)] w-fit">
              <button onClick={prevWeek} className="p-2 hover:bg-[var(--card)] rounded-xl transition-colors"><ChevronLeft/></button>
              <button onClick={goToToday} className="px-4 py-1.5 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl font-black text-xs uppercase shadow-[2px_2px_0px_var(--border)] active:shadow-none translate-y-[-2px] active:translate-y-0 transition-all">BU HAFTA</button>
              <button onClick={nextWeek} className="p-2 hover:bg-[var(--card)] rounded-xl transition-colors"><ChevronRight/></button>
           </div>

           {/* Center: Main App Title (Integrated for Screenshots) */}
           <div className="text-center">
              <h2 className="text-2xl font-black text-[var(--primary)] uppercase tracking-tight leading-none">Hubbe Haftalık Etkinlik Takvimi</h2>
              <p className="text-[10px] font-bold text-[var(--foreground)] opacity-30 uppercase tracking-[0.2em] mt-1">Haftalık Program Görünümü</p>
           </div>
           
            <div className="flex items-center gap-3 lg:justify-self-end">
               <div className="text-right">
                 <h2 className="text-xl font-black text-[#1565C0] uppercase leading-none">
                   {format(weekStart, 'MMMM yyyy', { locale: tr })}
                 </h2>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">HUBBE PROGRAMI</span>
               </div>
               
               <div className="flex items-center gap-2">
                 <button onClick={handleScreenshot} className="w-10 h-10 bg-[#1565C0] border-2 border-[var(--border)] rounded-xl flex items-center justify-center text-white shadow-[3px_3px_0px_var(--border)] hover:translate-y-1 hover:shadow-[2px_2px_0px_var(--border)] active:shadow-none active:translate-y-[4px] transition-all">
                   <Camera className="w-5 h-5" />
                 </button>
                 <div className="w-10 h-10 bg-[#1565C0] border-2 border-[var(--border)] rounded-xl flex items-center justify-center text-white shadow-[3px_3px_0px_var(--border)]">
                   <Hash className="w-5 h-5" />
                 </div>
               </div>
            </div>
         </div>

        {/* Calendar Grid Container */}
        <DndContext onDragEnd={handleDragEnd}>
          <div className="border-4 border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--background)] flex-1 min-h-[500px] flex flex-col">
            
            {/* Table Header */}
            <div className="grid grid-cols-[100px_repeat(7,1fr)] bg-[var(--card)]">
              <div className="border-r-3 border-b-3 border-[var(--border)] bg-[var(--accent)] flex items-center justify-center">
                 <LayoutGrid className="w-5 h-5 opacity-20" />
              </div>
              {days.map(day => (
                <div key={day.toISOString()} className={clsx(
                  "border-r-3 border-b-3 border-[var(--border)] last:border-r-0 p-3 text-center transition-colors",
                  isSameDay(day, startOfToday()) ? "bg-[var(--primary)] text-white" : "bg-[var(--card)]"
                )}>
                  <div className={clsx("text-xs font-black uppercase tracking-widest", isSameDay(day, startOfToday()) ? "text-white" : "text-[#1565C0]")}>{format(day, 'EEEE', { locale: tr })}</div>
                  <div className="text-2xl font-black">{format(day, 'd', { locale: tr })}</div>
                </div>
              ))}
            </div>

            {/* Table Body (Hours) */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {HOURS.map(hour => (
                <div key={hour} className="grid grid-cols-[100px_repeat(7,1fr)] min-h-[110px]">
                  <div className="border-r-3 border-b-3 border-[var(--border)] bg-[var(--accent)] flex items-center justify-center font-black text-lg">
                    {hour}:00
                  </div>
                  {days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd')
                    const slotId = `${dayStr}|${hour}`
                    const slotEvents = events.filter(e => {
                      const eDate = new Date(e.start)
                      return isSameDay(eDate, day) && eDate.getHours() === hour
                    })
                    return (
                      <DroppableSlot key={slotId} id={slotId} onAdd={() => {
                        setNewEventDate(`${dayStr}T${hour.toString().padStart(2, '0')}:00`)
                        setShowModal(true)
                      }}>
                        {slotEvents.map(ev => <DraggableEvent key={ev.id} event={ev} categories={categories} />)}
                      </DroppableSlot>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </DndContext>
      </div>

      {/* Modern Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in transition-all">
          <div className="bg-[var(--card)] rounded-[2.5rem] w-full max-w-lg border-4 border-[var(--border)] shadow-[20px_20px_0px_rgba(0,0,0,0.3)] relative p-8 transform animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">Etkinlik Oluştur</h3>
                <p className="text-xs font-bold text-gray-400 uppercase mt-1">Yeni bir program ekleyin.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-[var(--background)] border-3 border-[var(--border)] rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all group">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            
            <form onSubmit={handleAddEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black mb-2 uppercase">Etkinlik Türü</label>
                  <select 
                    value={selectedCategoryId} 
                    onChange={e => {
                      const val = e.target.value
                      setSelectedCategoryId(val === 'other' || val === '' ? val : Number(val))
                      const cat = categories.find(c => c.id === Number(val))
                      if (cat) setNewEventTitle(cat.name)
                      else if (val === 'other') setNewEventTitle('')
                    }}
                    className="w-full p-4 rounded-2xl border-3 border-[var(--border)] bg-[var(--background)] font-bold text-sm focus:shadow-[4px_4px_0px_var(--border)] transition-all outline-none"
                  >
                    <option value="">Seçiniz...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    <option value="other">Kendi Etkinliğim...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black mb-2 uppercase">Tarih / Saat</label>
                  <input 
                    type="datetime-local" 
                    value={newEventDate} 
                    onChange={e => setNewEventDate(e.target.value)} 
                    className="w-full p-4 rounded-2xl border-3 border-[var(--border)] bg-[var(--background)] font-bold text-sm focus:shadow-[4px_4px_0px_var(--border)] transition-all outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black mb-2 uppercase">Etkinlik Adı</label>
                <input 
                  type="text" 
                  placeholder="Başlık giriniz..."
                  value={newEventTitle} 
                  onChange={e => setNewEventTitle(e.target.value)} 
                  className="w-full p-4 rounded-2xl border-3 border-[var(--border)] bg-[var(--background)] font-black text-lg placeholder:text-gray-300 focus:shadow-[4px_4px_0px_var(--border)] transition-all outline-none" 
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#4CAF50] border-4 border-[var(--border)] text-white text-xl py-5 rounded-[1.5rem] font-black uppercase shadow-[6px_6px_0px_var(--border)] hover:translate-y-1 hover:shadow-[3px_3px_0px_var(--border)] active:shadow-none active:translate-y-[6px] transition-all">
                  PROGRAMA EKLE!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function DroppableSlot({ id, children, onAdd }: { id: string, children: React.ReactNode, onAdd: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={clsx(
      "border-r-3 border-b-3 border-[var(--border)] last:border-r-0 p-1 relative group transition-colors",
      isOver ? "bg-[var(--accent)]" : "bg-[var(--card)]"
    )}>
      <button onClick={onAdd} className="absolute inset-0 m-auto w-10 h-10 flex items-center justify-center bg-[var(--background)] border-3 border-[var(--border)] rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 shadow-[3px_3px_0px_var(--border)] hover:scale-110 active:scale-95">
        <Plus className="w-6 h-6 text-[var(--foreground)]" />
      </button>
      <div className="relative z-10 h-full w-full flex flex-col gap-1">
        {children}
      </div>
    </div>
  )
}

function DraggableEvent({ event, categories }: { event: Event, categories: Category[] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: event.id })
  const style = transform ? { 
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined
  
  const category = categories.find(c => c.id === event.categoryId)
  const bgColor = category?.color || '#29B6F6'
  
  return (
    <div 
      ref={setNodeRef} 
      style={{ ...style, backgroundColor: bgColor }} 
      {...listeners} 
      {...attributes} 
      className={clsx(
        "text-white text-[10px] p-2 rounded-xl border-3 border-[var(--border)] cursor-grab active:cursor-grabbing font-black uppercase tracking-tight shadow-[3px_3px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_rgba(0,0,0,0.2)] transition-all truncate",
        isDragging && "z-50 opacity-40 grayscale"
      )}
    >
      <div className="flex items-center gap-1">
         <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
         {event.title}
      </div>
    </div>
  )
}
