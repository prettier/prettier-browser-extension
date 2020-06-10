import React, { useCallback } from 'react'
import classNames from 'classnames'
import PropTypes from "prop-types";

import Code from './icons/code.svg'
import Description from './icons/description.svg'

const TabSwitcher = (props) => {
  const { setOptions, options } = props
  const { isJsonVisible } = options

  const onTabClick = useCallback((jsonVisible) => {
    setOptions({ ...options, isJsonVisible: jsonVisible });
  }, [options, setOptions])

  return (
    <div className='tabs'>
      <div
        className={classNames('tab', { active: !isJsonVisible })}
        onClick={() => onTabClick(false)}
        title='Settings (UI)'
      >
        <Description />
      </div>
      <div
        className={classNames('tab', { active: isJsonVisible })}
        onClick={() => onTabClick(true)}
        title='Settings (JSON)'
      >
        <Code />
      </div>
    </div>
  )
}

TabSwitcher.propTypes = {
  options: PropTypes.object.isRequired,
  setOptions: PropTypes.func.isRequired
}

export default TabSwitcher
