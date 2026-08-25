# 🤖 08. Go Операторы: Kubebuilder и controller-runtime

## 🏗️ Каркас оператора за 5 команд

```bash
# kubebuilder — официальный scaffolding (использует controller-runtime)
kubebuilder init --domain example.dev --repo gitlab.local/platform/backup-operator
kubebuilder create api --group apps --version v1 --kind BackupSchedule --resource --controller
make manifests        # сгенерировать CRD + RBAC из маркеров
make install          # применить CRD в кластер
make run              # запустить контроллер локально против kubeconfig
```

Структура:

```text
api/v1/backupschedule_types.go   # CRD-схема (Go-типы + маркеры)
internal/controller/
    backupschedule_controller.go  # Reconcile — сердце оператора
    suite_test.go                 # envtest: реальный apiserver в тестах!
Dockerfile, Makefile, config/rbac/
```

## 📐 API-типы: схема CRD кодом

```go
// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="Schedule",type=string,JSONPath=`.spec.schedule`
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`

type BackupScheduleSpec struct {
    // +kubebuilder:validation:Required
    Schedule string `json:"schedule"`            // cron-выражение
    // +kubebuilder:validation:Enum=daily;weekly;monthly
    Mode     string `json:"mode,omitempty"`
    Retention *int32 `json:"retention,omitempty"`
}

type BackupScheduleStatus struct {
    Phase             BackupPhase `json:"phase,omitempty"`
    LastBackupTime    *metav1.Time `json:"lastBackupTime,omitempty"`
    Conditions        []metav1.Condition `json:"conditions,omitempty"`   // стандарт K8s!
}

func (b *BackupSchedule) GetCondition(...) { ... }   // helpers через conditionsutil
```

`make manifests` превращает маркеры в OpenAPI-схему: валидация на admission без единой строки YAML.

## 🔄 Reconcile: единственный метод

```go
func (r *BackupScheduleReconciler) Reconcile(
    ctx context.Context, req ctrl.Request) (ctrl.Result, error) {

    var bs appsv1.BackupSchedule
    if err := r.Get(ctx, req.NamespacedName, &bs); err != nil {
        return ctrl.Result{}, client.IgnoreNotFound(err)   // удалён — норм
    }

    // 1. Гарантируем существование CronJob (create-or-update паттерн)
    desired := buildCronJob(&bs)
    if err := ctrl.SetControllerReference(&bs, desired, r.Scheme); err != nil {
        return ctrl.Result{}, err                          // ownerRef → GC каскадом
    }
    found := &batchv1.CronJob{}
    err := r.Get(ctx, types.NamespacedName{Name: desired.Name, Namespace: desired.Namespace}, found)
    switch {
    case errors.IsNotFound(err):
        if err := r.Create(ctx, desired); err != nil { return ctrl.Result{}, err }
    case err != nil:
        return ctrl.Result{}, err
    default:
        if !equality.Semantic.DeepEqual(found.Spec.JobTemplate.Spec.Template.Spec.Containers,
                                        desired.Spec.JobTemplate.Spec.Template.Spec.Containers) {
            desired.ResourceVersion = found.ResourceVersion      // optimistic locking
            if err := r.Update(ctx, desired); err != nil { return ctrl.Result{}, err }
        }
    }

    // 2. Статус + conditions
    meta.SetStatusCondition(&bs.Status.Conditions, metav1.Condition{
        Type: "Ready", Status: metav1.ConditionTrue, Reason: "CronJobSynced",
    })
    if err := r.Status().Update(ctx, &bs); err != nil { return ctrl.Result{}, err }

    // 3. Периодический пересмотр: не нужен resync-спам
    return ctrl.Result{RequeueAfter: time.Until(nextBackupTime(&bs))}, nil
}
```

Setup:

```go
func (r *BackupScheduleReconciler) SetupWithManager(m ctrl.Manager) error {
    return ctrl.NewControllerManagedBy(m).
        For(&appsv1.BackupSchedule{}).                    // наблюдаем CRD
        Owns(&batchv1.CronJob{}).                         // и его «детей» (по ownerRef)
        Complete(r)
}
```

`Owns` = события детей тоже триггерят reconcile родителя (кто-то удалил CronJob → восстановим).

## 🧪 envtest: реальный apiserver в юнит-тестах

```go
var _ = Describe("BackupSchedule", func() {
    It("creates CronJob from spec", func() {
        bs := &appsv1.BackupSchedule{
            Spec: appsv1.BackupScheduleSpec{Schedule: "0 3 * * *", Mode: "daily"},
        }
        Expect(k8sClient.Create(ctx, bs)).To(Succeed())
        eventually(func(g Gomega) {
            var cj batchv1.CronJobList
            g.Expect(k8sClient.List(ctx, &cj)).To(Succeed())
            g.Expect(cj.Items).To(HaveLen(1))
            g.Expect(cj.Items[0].Spec.Schedule).To(Equal("0 3 * * *"))
        }).Should(Succeed())
    })
})
```

```bash
make test        # поднимет etcd+apiserver (bin/k8s), прогонит Ginkgo — БЕЗ полного кластера
```

## 🚢 Продакшн-детали

| Тема | Решение |
|---|---|
| RBAC | генерируется из маркеров `//+kubebuilder:rbac:groups=batch,resources=cronjobs,verbs=create;update` |
| Webhooks | `kubebuilder create webhook --programmatic-validation` — validating/mutating CR |
| Метрики | controller-runtime отдаёт `/metrics`: `workqueue_*`, `controller_runtime_reconcile_errors_total` |
| HA | leader election включается флагом `--enable-leader-election`; два реплики безопасны |
| Finalizer | для очистки внешних ресурсов перед удалением: patch finalizer → DeletionTimestamp → cleanup → RemoveFinalizer |

Алерты на оператор: `rate(controller_runtime_reconcile_errors_total[10m]) > 0`, долгий `workqueue_depth > 0`.

## ❓ Пять вопросов для самопроверки

---


## ✅ Проверь себя

> Отвечай вслух до раскрытия ответа. Если «не помню» — вернись к разделу.


**В1. Зачем SetControllerReference (ownerRef) на создаваемых объектах?**
<details><summary>Ответ</summary>
(1) Garbage collector удалит CronJob при удалении родителя — без ownerRef остаются сироты. (2) Owns() в SetupWithManager работает именно по ownerRef: изменение ребёнка триггерит reconcile владельца. Это фундамент композиции ресурсов.
</details>

**В2. Почему IgnoreNotFound на Get — обязательный паттерн?**
<details><summary>Ответ</summary>
Событие могло относиться к уже удалённому ресурсу (или удаление пришло раньше чтения): NotFound — нормальное конечное состояние, а не ошибка. Возврат ошибки вызвал бы бесконечный ретрай несуществующего объекта.
</details>

**В3. Как избежать бесконечных update-циклов reconcile?**
<details><summary>Ответ</summary>
Обновлять только при реальном diff (DeepEqual до Update); статус обновлять через Status().Update отдельно от spec; не писать в status то, что сами же читаете как спусковой крючок; ResourceVersion от найденного объекта при Update. Иначе каждый ваш Update порождает новое событие → новый reconcile → петля.
</details>

**В4. Чем envtest лучше моков client-go?**
<details><summary>Ответ</summary>
Реальный kube-apiserver + etcd: работают настоящие семантика storage, validation по CRD-схеме, defaulting, RBAC-патчи статуса. Моки проверяют только вашу логику поверх выдуманного поведения клиента и пропускают интеграционные расхождения (например, required поля схемы).
</details>

**В5. Когда нужен finalizer и что произойдёт без него?**
<details><summary>Ответ</summary>
Когда удаление CR должно сопровождаться очисткой ВНЕШНИХ ресурсов (бакеты S3, DNS-записи, VM). Без finalizer объект исчезает мгновенно, GC чистит только внутрикластерных детей — внешние ресурсы утекают навсегда. Финализер держит объект в Terminating до вашего явного RemoveFinalizer после очистки.
</details>

---

*Что дальше:* [09. HTTP/gRPC сервисы](09-go-http-grpc-services.md) · [07. client-go](07-go-k8s-client-go.md)
