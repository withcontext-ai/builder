import LinkList from './link-list'

const DEFAULT_VALUE = [
  {
    href: '/apps',
    title: 'My Apps',
  },
  {
    href: '/datasets',
    title: 'Datasets',
  },
]

export default function MineList() {
  return <LinkList value={DEFAULT_VALUE} />
}
