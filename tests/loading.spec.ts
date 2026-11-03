/**
 * 装载接线：这个命令插件要被 profile 真的挂上，靠的是 package.json 里的
 * `dsh.bundle.patch` 声明 + patch 里那条裸包名的行。
 *
 * 2026-11-03 现场：package.json 没有 `dsh.bundle` 声明，宿主读 profile 时把
 * 这个 bundle **整个跳过**——启动日志里只留一句
 * `skipping profile bundle "@goodjin2/dsh-command-commit-merge-push": Error: … declares no dsh.bundle in its package.json`，
 * 命令不出现，界面上一个字的报错都没有。
 *
 * 本插件是**宿主侧**的命令插件（没有浏览器半边），所以不需要 `dsh.client`。
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** 仓库根：vitest 的 cwd 就是它。 */
const root = process.cwd()

const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  name?: string
  exports?: Record<string, { default?: string } | string>
  dsh?: { bundle?: { patch?: string }; client?: { platform?: string } }
}

describe('装载接线', () => {
  it('声明 bundle patch，profile 才会挂它', () => {
    expect(manifest.name).toBe('@goodjin2/dsh-command-commit-merge-push')
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    // 纯宿主侧插件：没有浏览器半边，也不要声明 dsh.client。
    expect(manifest.dsh?.client).toBeUndefined()
  })

  it('patch 里的挂载行用裸包名', () => {
    const patchPath = resolve(root, manifest.dsh!.bundle!.patch!)
    expect(existsSync(patchPath)).toBe(true)
    const patch = readFileSync(patchPath, 'utf8')
    const packageName = manifest.name!
    expect(patch).toContain(`name: '${packageName}'`)
    expect(patch).not.toContain(`name: '${packageName}/client'`)
  })

  it('包的入口是宿主侧入口（src/index.ts，带 apply）', () => {
    const main = manifest.exports?.['.'] as { default?: string } | undefined
    expect(main?.default).toBe('./src/index.ts')
    const entry = readFileSync(resolve(root, 'src/index.ts'), 'utf8')
    expect(entry).toContain('export function apply')
  })
})
