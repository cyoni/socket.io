import React from 'react'

function Layout({children}) {
  return (
    <div className='bg-gradient-to-r from-purple-400 to-violet-600 min-h-screen'>{children}</div>
  )
}

export default Layout