'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { 
  Plus, Shield, Code, PenTool, Layout, Star, Users, Zap, 
  MoreHorizontal, Crown, Terminal, Braces, Palette, 
  MessageSquare, UserPlus, Compass, Hammer, Cog, 
  Image as ImageIcon, Share2, TrendingUp, CheckCircle, Search
} from 'lucide-react'
import clsx from 'clsx'

interface Staff {
  id: number
  name: string
  badgeCode: string
  imageUrl: string
  teamId: number
}

interface Team {
  id: number
  name: string
  category: string
  staff: Staff[]
}

interface UnclassifiedBadge {
  code: string
  imageUrl: string
}

const CATEGORIES = [
  { name: 'Üst Ekip', color: 'red' },
  { name: 'Teknisyen Ekibi', color: 'blue' },
  { name: 'Alt Ekip', color: 'green' }
]

const RANK_LIST: Record<string, string[]> = {
  'Üst Ekip': ['Kurucu', 'Yönetici', 'Menajer', 'Moderatör', 'Deneme Moderatör'],
  'Teknisyen Ekibi': ['Geliştirici', 'Scripter', 'Tasarımcı', 'Marketing'],
  'Alt Ekip': ['Elçi', 'Mimar', 'Düzenek Ekibi', 'Grafiker', 'Reklamcı', 'Ekonomist']
}

const RANK_ICONS: Record<string, any> = {
  'Kurucu': Crown, 'Yönetici': Shield, 'Menajer': Star, 'Moderatör': MessageSquare, 'Deneme Moderatör': UserPlus,
  'Geliştirici': Terminal, 'Scripter': Braces, 'Tasarımcı': Palette, 'Marketing': Share2,
  'Elçi': Compass, 'Mimar': Hammer, 'Düzenek Ekibi': Cog, 'Grafiker': ImageIcon, 'Reklamcı': Search, 'Ekonomist': TrendingUp, 'Resmi': CheckCircle
}

export default function StaffPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [unclassified, setUnclassified] = useState<UnclassifiedBadge[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setLoading(true)
    await Promise.all([fetchStaff(), fetchUnclassified()])
    setLoading(false)
  }

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      if (res.ok) setTeams(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchUnclassified = async () => {
    try {
      const res = await fetch('/api/staff/unclassified')
      if (res.ok) setUnclassified(await res.json())
    } catch (e) { console.error(e) }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string // format: team-{name} or number (if id exists)

    if (activeId.startsWith('unclassified|')) {
      const code = activeId.split('|')[1]
      const badge = unclassified.find(b => b.code === code)
      if (!badge) return

      const name = code // Use badge code as name

      // We need either a numeric teamId or we need the API to handle rank names.
      // For now, let's find the matching team by name if possible.
      let teamId: number | null = null
      if (typeof overId === 'number' || !isNaN(Number(overId))) {
        teamId = Number(overId)
      } else if (overId.startsWith('team-')) {
        const teamName = overId.replace('team-', '')
        const found = teams.find(t => t.name === teamName)
        if (found) teamId = found.id
        else {
           // If team not found in DB, we really need the seed to have run.
           // However, I can try to hit the POST api with a name and let the backend handle it?
           // The backend currently expects teamId.
           alert('Bu rütbe henüz sisteme tanımlanmamış. Lütfen paneli yenileyin veya seeding işlemini bekleyin.')
           return
        }
      }

      if (!teamId) return

      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, badgeCode: code, imageUrl: badge.imageUrl, teamId })
      })

      if (res.ok) { fetchStaff(); fetchUnclassified(); }
    } else {
      // Movement between teams
      const staffId = Number(activeId)
      let targetTeamId: number | null = null
      if (!isNaN(Number(overId))) targetTeamId = Number(overId)
      else if (overId.startsWith('team-')) {
         const found = teams.find(t => t.name === overId.replace('team-', ''))
         if (found) targetTeamId = found.id
      }

      if (targetTeamId && !isNaN(staffId)) {
        await fetch('/api/staff', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: staffId, teamId: targetTeamId })
        })
        fetchStaff()
      }
    }
  }

  if (loading) return <div className="h-screen bg-[#0b0c10] flex items-center justify-center font-pixel text-primary animate-pulse">HUBBE YÜKLENİYOR...</div>

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6 flex flex-col gap-6 transition-colors duration-300">
      <DndContext onDragEnd={handleDragEnd}>
        
        {/* Top: Sınıflandırılmamış Bar */}
        <div className="bg-[var(--card)] border-4 border-[var(--border)] rounded-[1.5rem] p-4 shadow-[8px_8px_0px_var(--border)]">
           <div className="flex items-center gap-2 mb-4">
              <Plus className="w-5 h-5 text-gray-500" />
              <h2 className="text-sm font-black tracking-widest text-[#FFB300] uppercase">SINIFLANDIRILMAMIŞ (YENİ)</h2>
           </div>
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[var(--border)]">
              {unclassified.map(badge => (
                <DraggableBadge key={badge.code} badge={badge} />
              ))}
              {unclassified.length === 0 && (
                <div className="w-full py-8 text-center text-gray-600 text-xs font-pixel border-4 border-dashed border-[var(--border)] rounded-2xl">
                   YENİ ROZET BULUNAMADI
                </div>
              )}
           </div>
        </div>

        {/* 3 Column Matrix Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="flex flex-col gap-6 p-2">
              <div className={clsx(
                "p-4 rounded-2xl border-4 border-[var(--border)] shadow-[6px_6px_0px_var(--border)] flex items-center justify-between",
                cat.color === 'red' ? "bg-red-500/10" : cat.color === 'blue' ? "bg-blue-500/10" : "bg-green-500/10"
              )}>
                 <div className="flex items-center gap-3">
                    <div className={clsx("w-3 h-3 rounded-full", cat.color === 'red' ? "bg-red-500" : cat.color === 'blue' ? "bg-blue-500" : "bg-green-500")} />
                    <h2 className="font-black tracking-tighter uppercase text-xl">{cat.name}</h2>
                 </div>
                 <Plus className="w-5 h-5 opacity-50" />
              </div>

              <div className="space-y-4">
                {RANK_LIST[cat.name].map(rankName => {
                  const team = teams.find(t => t.name === rankName)
                  return <TeamRankCard key={rankName} rankName={rankName} team={team} />
                })}
              </div>
            </div>
          ))}
        </div>

      </DndContext>
    </div>
  )
}

function DraggableBadge({ badge }: { badge: UnclassifiedBadge }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `unclassified|${badge.code}`
  })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div 
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={clsx(
        "shrink-0 w-16 h-20 bg-[var(--background)] border-3 border-[var(--border)] rounded-[1.2rem] flex flex-col items-center justify-center p-2 cursor-grab active:cursor-grabbing hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_var(--border)] transition-all z-50",
        isDragging && "opacity-50 scale-110"
      )}
    >
      <img src={badge.imageUrl} alt={badge.code} className="w-10 h-10 object-contain mb-1 drop-shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
      <span className="text-[8px] text-gray-500 font-black tracking-tighter uppercase truncate w-full text-center">{badge.code}</span>
    </div>
  )
}

function TeamRankCard({ rankName, team }: { rankName: string, team?: Team }) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: team ? team.id : `team-${rankName}` 
  })
  const Icon = RANK_ICONS[rankName] || Users

  return (
    <div 
      ref={setNodeRef}
      className={clsx(
        "bg-[var(--card)] border-4 rounded-[1.5rem] p-4 transition-all min-h-[120px] shadow-[4px_4px_0px_var(--border)]",
        isOver ? "border-primary ring-8 ring-primary/20 scale-[1.03] z-10" : "border-[var(--border)]"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[var(--accent)] rounded-xl text-primary border-2 border-[var(--border)]">
           <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-black text-sm uppercase tracking-tight">{rankName}</h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {team?.staff.map(person => (
          <DraggableStaffItem key={person.id} staff={person} />
        ))}
        {(!team || team.staff.length === 0) && (
          <div className="col-span-full py-4 text-center border-2 border-dashed border-[var(--border)]/20 rounded-xl text-[10px] text-gray-500 font-pixel opacity-30">
            BOŞ
          </div>
        )}
      </div>
    </div>
  )
}

function DraggableStaffItem({ staff }: { staff: Staff }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: staff.id.toString()
  })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined

  return (
    <div 
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={clsx(
        "relative flex flex-col items-center group cursor-grab active:cursor-grabbing transition-all",
        isDragging && "z-50 opacity-0" // Hide original while dragging
      )}
    >
      <div className="w-10 h-10 bg-[var(--background)] border-3 border-[var(--border)] rounded-xl flex items-center justify-center p-1 group-hover:border-primary group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
        <img src={staff.imageUrl} alt={staff.name} className="w-full h-full object-contain" />
      </div>
      <span className="text-[8px] mt-1 text-gray-500 font-black truncate w-full text-center group-hover:text-primary">{staff.badgeCode}</span>
      
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded-lg border-2 border-[var(--border)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-black shadow-xl">
        {staff.name}
      </div>
    </div>
  )
}
