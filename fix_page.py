with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the old simulation UI block in the render section
old_sim_ui = """        {/* 단풍 전선 CG 오버레이 */}
        {isSimulating && (
          <div 
            className="absolute inset-0 pointer-events-none z-[35]"
            style={{
              background: `linear-gradient(to bottom, rgba(239,68,68,0.55) 0%, rgba(249,115,22,0.4) ${Math.max(0, simProgress - 10)}%, rgba(250,204,21,0.2) ${simProgress}%, transparent ${Math.min(100, simProgress + 15)}%, transparent 100%)`,
              mixBlendMode: 'color-burn',
              transition: 'background 0.05s linear'
            }}
          ></div>
        )}

        {/* 단풍 전선 시뮬레이터 버튼 (우측 상단) */}
        {!showSplash && mapLoaded && (
          <div className="absolute top-4 right-4 z-[40]">
            <button
              onClick={() => setIsSimulating(prev => !prev)}
              className="bg-slate-900/90 backdrop-blur-md text-orange-400 font-bold px-4 py-2.5 rounded-xl border border-orange-500/50 shadow-[0_4px_20px_rgba(249,115,22,0.3)] flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all active:scale-95"
            >
              <span className="text-xl">{isSimulating ? '🛑' : '🍁'}</span>
              <span className="hidden md:inline">{isSimulating ? '시뮬레이션 중지' : '단풍 전선 시뮬레이션'}</span>
            </button>
          </div>
        )}

        {/* 단풍 전선 진행 상황 날짜 패널 */}
        {isSimulating && (
          <div className="absolute top-20 right-4 z-[40] bg-slate-900/90 backdrop-blur-md border border-slate-700 px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center">
            <span className="text-slate-400 text-xs font-bold mb-1">단풍 진행 시기</span>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              {calculateSimDate(simProgress)}
            </span>
          </div>
        )}

        <div id="map" ref={mapContainerRef} className="w-full h-full bg-slate-900"></div>"""

new_sim_ui = """        {/* 단풍 CG 테스트용 날짜 슬라이더 - URL에 ?testDate=2026-10-15 추가 시 노출 */}
        {foliageTestDate && (
          <div className="absolute bottom-6 right-4 z-[50] bg-slate-900/95 backdrop-blur-md border border-orange-500/50 px-4 py-3 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[200px]">
            <span className="text-orange-400 text-xs font-black">🍁 단풍 테스트 날짜</span>
            <input
              type="date"
              value={foliageTestDate}
              onChange={e => setFoliageTestDate(e.target.value)}
              className="bg-slate-800 border border-slate-600 text-white text-sm px-2 py-1 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={() => setFoliageTestDate('')}
              className="text-xs text-slate-400 hover:text-white font-bold"
            >
              ✕ 테스트 종료 (오늘 날짜로)
            </button>
          </div>
        )}

        <div id="map" ref={mapContainerRef} className="w-full h-full bg-slate-900"></div>"""

if old_sim_ui in content:
    content = content.replace(old_sim_ui, new_sim_ui, 1)
    print("SUCCESS: Replaced old simulation UI with test date slider")
else:
    print("ERROR: Target not found")
    # Debug - find isSimulating references
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'isSimulating' in line or 'simProgress' in line or 'calculateSimDate' in line:
            print(f"Line {i+1}: {line}")

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
