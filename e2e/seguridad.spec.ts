import { test, expect, Page } from '@playwright/test';
async function login(page:Page, username:string) {
  await page.goto('/login');
  await page.locator('[formcontrolname=username]').fill(username);
  await page.locator('[formcontrolname=password]').fill('Auto2026*');
  await page.getByRole('button', {name:'Ingresar al taller'}).click();
  await expect(page).toHaveURL(/\/servicios$/);
  await expect(page.getByText('SRV-001', {exact:true})).toBeVisible();
}
test('roles, menú reactivo, ruta directa y 403 conservan sesión', async ({page})=>{
  await login(page,'admin');
  await expect(page.locator('nav a')).toHaveCount(5);
  await page.getByRole('button',{name:'Salir',exact:true}).click();
  await login(page,'asesor');
  await expect(page.locator('nav a')).toHaveCount(4);
  await expect(page.locator('nav a[href="/reportes"]')).toHaveCount(0);
  // Simula manipulación del permiso local: la API debe mantener el control real.
  await page.evaluate(()=>{
    const s=JSON.parse(sessionStorage.getItem('autoandes.sesion')!);
    s.permisos.push('REPORTE_VER');sessionStorage.setItem('autoandes.sesion',JSON.stringify(s));
  });
  await page.reload();
  await page.goto('/reportes');
  await expect(page.getByText('No tiene permiso para esta operación',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>!!sessionStorage.getItem('autoandes.sesion'))).toBe(true);
  await page.screenshot({path:'../evidencias/14b-403-conserva-sesion.png'});
  await page.getByRole('button',{name:'Salir',exact:true}).click();
  await login(page,'jefe');
  await expect(page.locator('nav a')).toHaveCount(4);
  await expect(page.locator('nav a[href="/ordenes/nueva"]')).toHaveCount(0);
  await page.goto('/ordenes/nueva');
  await expect(page.getByRole('heading',{name:'Acceso denegado',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>!!sessionStorage.getItem('autoandes.sesion'))).toBe(true);
});
test('token alterado produce 401 y returnUrl; invitadoGuard y 404',async ({page})=>{
  await login(page,'admin');
  await page.goto('/login');await expect(page).toHaveURL(/\/servicios$/);
  await page.goto('/no-existe');await expect(page.getByRole('heading',{name:'Página no encontrada'})).toBeVisible();
  await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('autoandes.sesion')!);s.token='alterado.'+s.token;sessionStorage.setItem('autoandes.sesion',JSON.stringify(s));});
  await page.goto('/vehiculos');await expect(page).toHaveURL(/\/login\?returnUrl=/);
  expect(await page.evaluate(()=>sessionStorage.getItem('autoandes.sesion'))).toBeNull();
  await page.screenshot({path:'../evidencias/21-token-alterado-returnurl.png'});
});
test('cierre automático al vencer la sesión y authGuard sin sesión',async ({page})=>{
  await page.goto('/ordenes');await expect(page).toHaveURL(/\/login\?returnUrl=/);
  await login(page,'admin');
  // Acorta solo el reloj de sesión del navegador para evitar esperar una hora.
  await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('autoandes.sesion')!);s.vence=Date.now()+1500;sessionStorage.setItem('autoandes.sesion',JSON.stringify(s));});
  await page.reload();await expect(page).toHaveURL(/\/login\?returnUrl=/,{timeout:7000});
  expect(await page.evaluate(()=>sessionStorage.getItem('autoandes.sesion'))).toBeNull();
});
